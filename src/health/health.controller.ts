import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Verificação de prontidão (readiness)',
    description: 'Verifica se a aplicação está pronta para receber tráfego'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicação está pronta',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-11-22T01:23:00.000Z'
      }
    }
  })
  readiness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('liveness')
  @ApiOperation({ 
    summary: 'Verificação de vivacidade (liveness)',
    description: 'Verifica se a aplicação está viva e respondendo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicação está viva',
    schema: {
      example: {
        status: 'alive'
      }
    }
  })
  liveness() {
    return { status: 'alive' };
  }
}
