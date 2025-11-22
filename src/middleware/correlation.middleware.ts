// src/middleware/correlation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from '../lib/logger';

export function correlationMiddleware(req: Request & { logger?: any; correlationId?: string }, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.correlationId = id;
  req.logger = getLogger('http', id);
  res.setHeader('x-request-id', id);
  next();
}
