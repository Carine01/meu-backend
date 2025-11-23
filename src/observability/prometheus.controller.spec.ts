import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusController } from './prometheus.controller';
import { Response } from 'express';

describe('PrometheusController', () => {
  let controller: PrometheusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrometheusController],
    }).compile();

    controller = module.get<PrometheusController>(PrometheusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return metrics in Prometheus format', async () => {
    const mockResponse = {
      set: jest.fn(),
      end: jest.fn(),
    } as unknown as Response;

    await controller.getMetrics(mockResponse);

    expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', expect.any(String));
    expect(mockResponse.end).toHaveBeenCalledWith(expect.any(String));
  });

  it('should expose login metrics when they exist', async () => {
    // Import and increment metrics to ensure they exist
    const prometheusMetrics = await import('./prometheus.metrics');
    prometheusMetrics.loginAttempts.inc();
    prometheusMetrics.loginFailures.inc();

    const endMock = jest.fn();
    const mockResponse = {
      set: jest.fn(),
      end: endMock,
    } as unknown as Response;

    await controller.getMetrics(mockResponse);

    const metricsOutput = endMock.mock.calls[0][0] as string;
    
    // Check if login metrics are present
    expect(metricsOutput).toContain('login_attempts_total');
    expect(metricsOutput).toContain('login_failures_total');
  });
});
