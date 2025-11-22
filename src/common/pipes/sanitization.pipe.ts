import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    
    return value;
  }

  private sanitizeString(str: string): string {
    // Remove potential XSS patterns
    let sanitized = str.trim();
    
    // Remove HTML tags - use more robust approach
    // Repeatedly remove tags until none are left
    let prevLength;
    do {
      prevLength = sanitized.length;
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } while (sanitized.length < prevLength);
    
    // Remove dangerous protocols - check for all variants
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    
    // Remove event handlers - use multiple passes for complete removal
    do {
      prevLength = sanitized.length;
      sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');
    } while (sanitized.length < prevLength);
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.transform(item, {} as ArgumentMetadata));
    }
    
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = this.transform(obj[key], {} as ArgumentMetadata);
      }
    }
    return sanitized;
  }
}
