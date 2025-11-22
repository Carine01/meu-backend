// src/shared/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  }
});

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private logger: pino.Logger;
  private serviceName: string;
  private correlationId?: string;

  constructor(serviceName: string, correlationId?: string) {
    this.serviceName = serviceName;
    this.correlationId = correlationId;
    
    const bindings: Record<string, any> = { service: serviceName };
    if (correlationId) bindings.correlationId = correlationId;
    
    this.logger = baseLogger.child(bindings);
  }

  /**
   * Cria child logger com correlationId
   */
  withCorrelation(correlationId: string): CustomLoggerService {
    return new CustomLoggerService(this.serviceName, correlationId);
  }

  /**
   * Cria child logger com contexto adicional
   */
  withContext(context: Record<string, any>): CustomLoggerService {
    const logger = new CustomLoggerService(this.serviceName, this.correlationId);
    logger.logger = this.logger.child(context);
    return logger;
  }

  /**
   * Log nível info
   */
  log(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.info(context, message);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * Log nível error
   */
  error(message: string, trace?: string, context?: Record<string, any>) {
    const errorContext = {
      ...context,
      ...(trace && { stack: trace })
    };
    this.logger.error(errorContext, message);
  }

  /**
   * Log nível warn
   */
  warn(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.warn(context, message);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log nível debug
   */
  debug(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.debug(context, message);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Log nível verbose (trace no pino)
   */
  verbose(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.trace(context, message);
    } else {
      this.logger.trace(message);
    }
  }

  /**
   * Helper para redact dados sensíveis
   */
  static redact<T extends Record<string, any>>(obj: T, fields: string[] = ['password', 'token', 'secret', 'authorization']): T {
    const copy = { ...obj } as Record<string, any>;
    fields.forEach(field => {
      if (copy[field]) {
        copy[field] = '***REDACTED***';
      }
    });
    return copy as T;
  }
}

/**
 * Factory function para criar logger
 */
export function getLogger(serviceName: string, correlationId?: string): CustomLoggerService {
  return new CustomLoggerService(serviceName, correlationId);
}
