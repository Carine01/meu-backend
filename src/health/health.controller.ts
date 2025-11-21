import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  readiness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('liveness')
  liveness() {
    return { status: 'alive' };
  }
}
