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
      isWhatsAppNumber: jest.fn(),
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
    it('deve retornar status ok e timestamp', () => {
      const result = controller.health();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      
      // Verificar que o timestamp é uma data ISO válida
      const timestamp = new Date(result.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('deve retornar timestamp no formato ISO', () => {
      const result = controller.health();
      
      // Verificar formato ISO 8601
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(result.timestamp).toMatch(isoRegex);
    });
  });
});
