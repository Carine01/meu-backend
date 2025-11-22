import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should record successful requests', () => {
    service.recordRequest(true);
    const metrics = service.getRequestMetrics();
    expect(metrics.totalRequests).toBe(1);
    expect(metrics.successfulRequests).toBe(1);
    expect(metrics.failedRequests).toBe(0);
  });

  it('should record failed requests', () => {
    service.recordRequest(false);
    const metrics = service.getRequestMetrics();
    expect(metrics.totalRequests).toBe(1);
    expect(metrics.successfulRequests).toBe(0);
    expect(metrics.failedRequests).toBe(1);
  });

  it('should return system metrics', () => {
    const systemMetrics = service.getSystemMetrics();
    expect(systemMetrics).toHaveProperty('uptime');
    expect(systemMetrics).toHaveProperty('memoryUsage');
    expect(systemMetrics).toHaveProperty('nodeVersion');
    expect(systemMetrics).toHaveProperty('pid');
    expect(systemMetrics.nodeVersion).toBe(process.version);
  });

  it('should reset metrics', () => {
    service.recordRequest(true);
    service.recordRequest(false);
    service.reset();
    const metrics = service.getRequestMetrics();
    expect(metrics.totalRequests).toBe(0);
    expect(metrics.successfulRequests).toBe(0);
    expect(metrics.failedRequests).toBe(0);
  });

  it('should return all metrics', () => {
    service.recordRequest(true);
    const allMetrics = service.getAllMetrics();
    expect(allMetrics).toHaveProperty('requests');
    expect(allMetrics).toHaveProperty('system');
    expect(allMetrics).toHaveProperty('timestamp');
  });
});
