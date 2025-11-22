import { Injectable } from '@nestjs/common';

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestTime?: Date;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  nodeVersion: string;
  pid: number;
}

@Injectable()
export class MetricsService {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
  };

  private startTime: number = Date.now();

  recordRequest(success: boolean = true) {
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    this.metrics.lastRequestTime = new Date();
  }

  getRequestMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  getSystemMetrics(): SystemMetrics {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      uptime,
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  getAllMetrics() {
    return {
      requests: this.getRequestMetrics(),
      system: this.getSystemMetrics(),
      timestamp: new Date().toISOString(),
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    };
    this.startTime = Date.now();
  }
}
