import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check - readiness', description: 'Verifica se a aplicação está pronta para receber requisições' })
  @ApiResponse({ status: 200, description: 'Aplicação operacional', schema: { example: { status: 'ok', timestamp: '2025-01-01T00:00:00.000Z' } } })
  readiness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Health check - liveness', description: 'Verifica se a aplicação está viva' })
  @ApiResponse({ status: 200, description: 'Aplicação viva', schema: { example: { status: 'alive' } } })
  liveness() {
    return { status: 'alive' };
  }
}
