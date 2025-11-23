import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClinicId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-clinic-id'] || null;
  },
);

export const RequireClinicId = () => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const req = args[0];
      if (!req?.headers?.['x-clinic-id']) {
        throw new Error('x-clinic-id header is required');
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}
