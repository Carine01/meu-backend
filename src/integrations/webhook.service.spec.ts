import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

describe('WebhookService', () => {
  let service: WebhookService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'WEBHOOK_URL') return 'https://webhook.test.com/hook';
              if (key === 'WEBHOOK_TOKEN') return 'test-token-123';
              if (key === 'MAKE_WEBHOOK_URL') return 'https://hook.us1.make.com/test';
              if (key === 'MAKE_TOKEN') return 'make-token-456';
              if (key === 'ZAPIER_WEBHOOK_URL') return 'https://hooks.zapier.com/test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendWebhook', () => {
    it('deve enviar webhook com Authorization header', async () => {
      const mockResponse = { status: 200, data: { success: true, id: 123 } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      const payload = { leadId: '123', nome: 'Teste', phone: '+5511999999999' };
      const result = await service.sendWebhook(payload);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://webhook.test.com/hook',
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            'Content-Type': 'application/json',
            'User-Agent': 'Elevare-Backend/1.0',
          }),
          timeout: 10000,
        }),
      );
      expect(result).toEqual({ success: true, id: 123 });
    });

    it('deve permitir URL e token customizados', async () => {
      const mockResponse = { status: 200, data: { ok: true } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      await service.sendWebhook(
        { test: true },
        'https://custom-url.com/hook',
        'custom-token-789',
      );

      expect(httpService.post).toHaveBeenCalledWith(
        'https://custom-url.com/hook',
        { test: true },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-token-789',
          }),
        }),
      );
    });

    it('deve lançar erro se WEBHOOK_URL não estiver configurado', async () => {
      const moduleWithoutUrl: TestingModule = await Test.createTestingModule({
        providers: [
          WebhookService,
          { provide: HttpService, useValue: { post: jest.fn() } },
          {
            provide: ConfigService,
            useValue: { get: jest.fn(() => null) },
          },
        ],
      }).compile();

      const serviceWithoutUrl = moduleWithoutUrl.get<WebhookService>(WebhookService);
      
      await expect(serviceWithoutUrl.sendWebhook({ test: true })).rejects.toThrow(
        'WEBHOOK_URL não configurado',
      );
    });

    it('deve capturar erro HTTP e lançar HttpException', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        message: 'Request failed',
      } as AxiosError;

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => axiosError) as any);

      await expect(service.sendWebhook({ test: true })).rejects.toThrow(HttpException);
      await expect(service.sendWebhook({ test: true })).rejects.toThrow(
        expect.objectContaining({ status: 401 }),
      );
    });

    it('deve capturar erro de rede e lançar SERVICE_UNAVAILABLE', async () => {
      const networkError = {
        message: 'Network timeout',
      } as AxiosError;

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => networkError) as any);

      await expect(service.sendWebhook({ test: true })).rejects.toThrow(HttpException);
      await expect(service.sendWebhook({ test: true })).rejects.toThrow(
        expect.objectContaining({ status: HttpStatus.SERVICE_UNAVAILABLE }),
      );
    });
  });

  describe('sendToMake', () => {
    it('deve enviar para Make.com com URL e token específicos', async () => {
      const mockResponse = { status: 200, data: { accepted: true } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      const payload = { leadId: '123', event: 'lead_created' };
      const result = await service.sendToMake(payload);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://hook.us1.make.com/test',
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer make-token-456',
          }),
        }),
      );
      expect(result).toEqual({ accepted: true });
    });

    it('deve retornar falha se MAKE_WEBHOOK_URL não configurado', async () => {
      const moduleWithoutMake: TestingModule = await Test.createTestingModule({
        providers: [
          WebhookService,
          { provide: HttpService, useValue: { post: jest.fn() } },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'WEBHOOK_URL') return 'https://default.com';
                return null;
              }),
            },
          },
        ],
      }).compile();

      const serviceWithoutMake = moduleWithoutMake.get<WebhookService>(WebhookService);
      const result = await serviceWithoutMake.sendToMake({ test: true });

      expect(result).toEqual({ ok: false, message: 'Make.com não configurado' });
    });
  });

  describe('sendToZapier', () => {
    it('deve enviar para Zapier com URL específica', async () => {
      const mockResponse = { status: 200, data: { status: 'success' } };
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse) as any);

      const payload = { leadId: '456', action: 'lead_updated' };
      const result = await service.sendToZapier(payload);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://hooks.zapier.com/test',
        payload,
        expect.any(Object),
      );
      expect(result).toEqual({ status: 'success' });
    });

    it('deve retornar falha se ZAPIER_WEBHOOK_URL não configurado', async () => {
      const moduleWithoutZapier: TestingModule = await Test.createTestingModule({
        providers: [
          WebhookService,
          { provide: HttpService, useValue: { post: jest.fn() } },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'WEBHOOK_URL') return 'https://default.com';
                return null;
              }),
            },
          },
        ],
      }).compile();

      const serviceWithoutZapier =
        moduleWithoutZapier.get<WebhookService>(WebhookService);
      const result = await serviceWithoutZapier.sendToZapier({ test: true });

      expect(result).toEqual({ ok: false, message: 'Zapier não configurado' });
    });
  });
});

