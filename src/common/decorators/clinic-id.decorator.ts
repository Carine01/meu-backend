import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ClinicId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-clinic-id'] || null;
  },
);

export const RequireClinicId = () => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // In NestJS, we need to get the execution context
      // This is a simplified implementation - for production, consider using a Guard instead
      const dto = args.find((arg) => arg && typeof arg === 'object' && 'clinicId' in arg);
      if (!dto || !dto.clinicId) {
        throw new BadRequestException('x-clinic-id header is required');
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}
