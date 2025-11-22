// src/shared/logger/correlation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interceptor para adicionar correlationId em todas as requests
 * e propagar para os logs
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Gerar ou usar correlationId existente
    const correlationId = request.headers['x-request-id'] || 
                         request.headers['x-correlation-id'] || 
                         uuidv4();

    // Adicionar ao request para usar nos services
    request.correlationId = correlationId;

    // Adicionar ao response header
    response.setHeader('x-request-id', correlationId);
    response.setHeader('x-correlation-id', correlationId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        // Log da request pode ser feito aqui se necessário
        // Para evitar poluição, apenas em debug
        if (process.env.LOG_LEVEL === 'debug') {
          console.log({
            correlationId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            durationMs: duration
          });
        }
      })
    );
  }
}
