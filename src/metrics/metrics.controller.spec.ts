import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsService],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all metrics', () => {
    const result = controller.getMetrics();
    expect(result).toHaveProperty('requests');
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return request metrics', () => {
    const result = controller.getRequestMetrics();
    expect(result).toHaveProperty('totalRequests');
    expect(result).toHaveProperty('successfulRequests');
    expect(result).toHaveProperty('failedRequests');
  });

  it('should return system metrics', () => {
    const result = controller.getSystemMetrics();
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('memoryUsage');
    expect(result).toHaveProperty('nodeVersion');
    expect(result).toHaveProperty('pid');
  });
});
