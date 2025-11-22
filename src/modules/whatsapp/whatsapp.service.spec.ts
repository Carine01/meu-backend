import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { WhatsAppProvider, MessageStatus } from './whatsapp-provider.interface';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let mockProvider: jest.Mocked<WhatsAppProvider>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Mock do provider
    mockProvider = {
      sendMessage: jest.fn(),
      sendMedia: jest.fn(),
      sendTemplate: jest.fn(),
      getMessageStatus: jest.fn(),
      checkNumber: jest.fn(),
    } as any;

    // Mock do ConfigService
    mockConfigService = {
      get: jest.fn().mockReturnValue('baileys'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        {
          provide: 'WHATSAPP_PROVIDER',
          useValue: mockProvider,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendTextMessage', () => {
    it('deve enviar mensagem de texto com sucesso', async () => {
      const mockMessageId = 'msg123';
      mockProvider.sendMessage.mockResolvedValue(mockMessageId);

      const result = await service.sendTextMessage('+5511999999999', 'Olá!');

      expect(result).toEqual({
        messageId: mockMessageId,
        status: MessageStatus.SENT,
        timestamp: expect.any(Date),
      });
      expect(mockProvider.sendMessage).toHaveBeenCalledWith('+5511999999999', 'Olá!');
    });

    it('deve lançar erro se envio falhar', async () => {
      mockProvider.sendMessage.mockRejectedValue(new Error('Erro de rede'));

      await expect(
        service.sendTextMessage('+5511999999999', 'Olá!')
      ).rejects.toThrow('Erro de rede');
    });
  });

  describe('sendWithRetry', () => {
    it('deve tentar enviar 3 vezes antes de falhar', async () => {
      mockProvider.sendMessage.mockRejectedValue(new Error('Timeout'));

      await expect(
        service.sendWithRetry('+5511999999999', 'Teste', 3)
      ).rejects.toThrow('Falha ao enviar mensagem após 3 tentativas');

      expect(mockProvider.sendMessage).toHaveBeenCalledTimes(3);
    });

    it('deve ter sucesso na segunda tentativa', async () => {
      const mockMessageId = 'msg456';
      mockProvider.sendMessage
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce(mockMessageId);

      const result = await service.sendWithRetry('+5511999999999', 'Teste', 3);

      expect(result.messageId).toBe(mockMessageId);
      expect(mockProvider.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('isWhatsAppNumber', () => {
    it('deve verificar se número tem WhatsApp', async () => {
      mockProvider.checkNumber.mockResolvedValue(true);

      const result = await service.isWhatsAppNumber('+5511999999999');

      expect(result).toBe(true);
      expect(mockProvider.checkNumber).toHaveBeenCalledWith('+5511999999999');
    });

    it('deve retornar false para número sem WhatsApp', async () => {
      mockProvider.checkNumber.mockResolvedValue(false);

      const result = await service.isWhatsAppNumber('+5511888888888');

      expect(result).toBe(false);
    });
  });

  describe('sendMediaMessage', () => {
    it('deve enviar mídia com sucesso', async () => {
      const mockMessageId = 'media123';
      mockProvider.sendMedia.mockResolvedValue(mockMessageId);

      const result = await service.sendMediaMessage(
        '+5511999999999',
        'https://example.com/image.jpg',
        'Legenda da imagem'
      );

      expect(result.messageId).toBe(mockMessageId);
      expect(mockProvider.sendMedia).toHaveBeenCalledWith(
        '+5511999999999',
        'https://example.com/image.jpg',
        'Legenda da imagem'
      );
    });
  });

  describe('sendTemplateMessage', () => {
    it('deve enviar template aprovado', async () => {
      const mockMessageId = 'template123';
      mockProvider.sendTemplate.mockResolvedValue(mockMessageId);

      const result = await service.sendTemplateMessage(
        '+5511999999999',
        'hello_world',
        ['Maria', 'Silva']
      );

      expect(result.messageId).toBe(mockMessageId);
      expect(mockProvider.sendTemplate).toHaveBeenCalledWith(
        '+5511999999999',
        'hello_world',
        ['Maria', 'Silva']
      );
    });
  });
});
