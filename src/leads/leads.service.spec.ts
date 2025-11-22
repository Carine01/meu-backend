import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { IARA_CONFIG_TOKEN } from './iara-config.interface';

describe('LeadsService', () => {
  let service: LeadsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: IARA_CONFIG_TOKEN,
          useValue: {
            edgeUrl: 'http://localhost:3000/test/mock500',
            secret: 'fake',
            defaultClinic: 'default',
            defaultOrigem: 'web',
          },
        },
      ],
    }).compile();
    service = module.get<LeadsService>(LeadsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retry on 5xx and fail after max retries', async () => {
    const error = { response: { status: 500 }, message: 'fail' };
    (httpService.post as jest.Mock).mockReturnValue(throwError(() => error));
    await expect(service.enviarLeadParaSupabase({ nome: 'Teste', phone: '123' })).rejects.toThrow();
    expect(httpService.post).toHaveBeenCalled();
  }, 15000); // Timeout de 15 segundos para teste de retry

  it('should succeed on first try', async () => {
    (httpService.post as jest.Mock).mockReturnValue(of({ data: { ok: true, id: 1 } }));
    const result = await service.enviarLeadParaSupabase({ nome: 'Teste', phone: '123' });
    expect(result).toEqual({ ok: true, id: 1 });
  });
});

