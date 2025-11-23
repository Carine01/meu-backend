import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('readiness', () => {
    it('deve retornar status ok e timestamp', () => {
      const result = controller.readiness();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      
      // Verificar que o timestamp é uma data ISO válida
      const timestamp = new Date(result.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('deve retornar timestamp no formato ISO', () => {
      const result = controller.readiness();
      
      // Verificar formato ISO 8601
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(result.timestamp).toMatch(isoRegex);
    });
  });

  describe('liveness', () => {
    it('deve retornar status alive', () => {
      const result = controller.liveness();
      
      expect(result).toHaveProperty('status', 'alive');
    });
  });
});
