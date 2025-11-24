import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitizar inputs recursivamente
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  private sanitizeString(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Sanitização mais robusta - remove todos os caracteres potencialmente perigosos
    // em vez de usar regex simples que podem ser contornados
    let sanitized = value;

    // Remove null bytes que podem truncar strings
    sanitized = sanitized.replace(/\0/g, '');

    // Codifica caracteres HTML especiais para prevenir XSS
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove protocolos perigosos (javascript:, data:, vbscript:, etc)
    // usando uma abordagem mais segura
    const dangerousProtocols = [
      'javascript:',
      'data:',
      'vbscript:',
      'file:',
      'about:',
    ];
    const lowerValue = sanitized.toLowerCase();
    for (const protocol of dangerousProtocols) {
      if (lowerValue.includes(protocol)) {
        // Remove completamente o valor se contiver protocolos perigosos
        return '';
      }
    }

    return sanitized;
  }
}
