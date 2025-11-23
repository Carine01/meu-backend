import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Decorator to extract and validate x-clinic-id from request headers
 * Throws BadRequestException if header is missing or empty
 * Supports both lowercase and mixed case header names
 * 
 * @example
 * ```typescript
 * @Get()
 * async getData(@ClinicId() clinicId: string) {
 *   // clinicId is guaranteed to be non-empty
 * }
 * ```
 */
export const ClinicId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // Support both 'x-clinic-id' and 'X-Clinic-Id'
    const clinicId = request.headers['x-clinic-id'] || request.headers['X-Clinic-Id'];

    if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
      throw new BadRequestException(
        'x-clinic-id header is required and must not be empty'
      );
    }

    return clinicId.trim();
  },
);
