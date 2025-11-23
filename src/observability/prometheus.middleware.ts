import { Request, Response, NextFunction } from 'express';
import { httpRequestDurationMs } from './prometheus.metrics';

export function prometheusMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDurationMs.startTimer();
    res.on('finish', () => {
      end({ method: req.method, route: req.route?.path || req.path, code: res.statusCode });
    });
    next();
  };
}
