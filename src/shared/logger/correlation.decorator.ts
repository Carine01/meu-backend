// src/shared/logger/correlation.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para injetar correlationId nos controllers
 * 
 * @example
 * async create(@CorrelationId() correlationId: string) {
 *   const logger = getLogger('auth', correlationId);
 *   logger.info('Creating user...');
 * }
 */
export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.correlationId || 'no-correlation-id';
  },
);
