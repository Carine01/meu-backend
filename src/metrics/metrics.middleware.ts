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

    // Use response finish event instead of modifying res.send
    res.on('finish', () => {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      this.metricsService.recordRequest(success);
    });

    next();
  }
}
