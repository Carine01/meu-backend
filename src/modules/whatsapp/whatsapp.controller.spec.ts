import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

describe('WhatsAppController', () => {
  let controller: WhatsAppController;
  let mockWhatsAppService: jest.Mocked<WhatsAppService>;

  beforeEach(async () => {
    // Mock do WhatsAppService
    mockWhatsAppService = {
      sendTextMessage: jest.fn(),
      sendMediaMessage: jest.fn(),
      sendTemplateMessage: jest.fn(),
      sendWithRetry: jest.fn(),
      isWhatsAppNumber: jest.fn(),
      getMessageStatus: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsAppController],
      providers: [
        {
          provide: WhatsAppService,
          useValue: mockWhatsAppService,
        },
      ],
    }).compile();

    controller = module.get<WhatsAppController>(WhatsAppController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('deve retornar status ok com timestamp', () => {
      const result = controller.health();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('deve retornar timestamp no formato ISO', () => {
      const result = controller.health();
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(result.timestamp).toMatch(timestampRegex);
    });
  });

  describe('checkNumber', () => {
    it('deve verificar se número tem WhatsApp', async () => {
      mockWhatsAppService.isWhatsAppNumber.mockResolvedValue(true);

      const result = await controller.checkNumber('+5511999999999');

      expect(result).toEqual({
        phoneNumber: '+5511999999999',
        hasWhatsApp: true,
      });
      expect(mockWhatsAppService.isWhatsAppNumber).toHaveBeenCalledWith('+5511999999999');
    });
  });
});
