import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    req.clinicId = req.headers['x-clinic-id'] || (req.user && req.user.clinicId);
    return true;
  }
}
