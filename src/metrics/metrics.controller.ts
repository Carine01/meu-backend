import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Obter métricas da aplicação', 
    description: 'Retorna métricas de requisições e sistema (uptime, memória, etc.)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas obtidas com sucesso',
    schema: {
      example: {
        requests: {
          totalRequests: 100,
          successfulRequests: 95,
          failedRequests: 5,
          lastRequestTime: '2025-01-01T00:00:00.000Z'
        },
        system: {
          uptime: 3600,
          memoryUsage: {
            rss: 50000000,
            heapTotal: 30000000,
            heapUsed: 20000000,
            external: 1000000
          },
          nodeVersion: 'v20.0.0',
          pid: 1234
        },
        timestamp: '2025-01-01T00:00:00.000Z'
      }
    }
  })
  getMetrics() {
    return this.metricsService.getAllMetrics();
  }

  @Get('requests')
  @ApiOperation({ 
    summary: 'Obter métricas de requisições', 
    description: 'Retorna apenas as métricas relacionadas a requisições HTTP' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas de requisições obtidas com sucesso' 
  })
  getRequestMetrics() {
    return this.metricsService.getRequestMetrics();
  }

  @Get('system')
  @ApiOperation({ 
    summary: 'Obter métricas do sistema', 
    description: 'Retorna métricas do sistema (uptime, memória, versão Node.js)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas do sistema obtidas com sucesso' 
  })
  getSystemMetrics() {
    return this.metricsService.getSystemMetrics();
  }
}
