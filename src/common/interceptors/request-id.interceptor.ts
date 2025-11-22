import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate or use existing request ID
    const requestId = request.headers['x-request-id'] || randomUUID();
    
    // Attach request ID to request object for logging
    request.requestId = requestId;
    
    // Add request ID to response headers
    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        // Request ID is already in the response header
      }),
    );
  }
}
