import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip metrics endpoint itself to avoid infinite loops
    if (req.path.startsWith('/metrics')) {
      return next();
    }

    const metricsService = this.metricsService;
    const originalSend = res.send;
    
    res.send = function (this: Response, data: any) {
      // Record the request when response is sent
      const success = res.statusCode >= 200 && res.statusCode < 400;
      metricsService.recordRequest(success);
      return originalSend.call(this, data);
    };

    next();
  }
}
