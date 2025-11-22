import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  private readonly startTime = Date.now();

  @Get()
  @ApiOperation({ 
    summary: 'Métricas da aplicação',
    description: 'Retorna métricas de uso e performance da aplicação em formato Prometheus'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas em formato Prometheus',
    content: {
      'text/plain': {
        example: '# HELP app_uptime_seconds Tempo de atividade da aplicação em segundos\n# TYPE app_uptime_seconds gauge\napp_uptime_seconds 3600\n'
      }
    }
  })
  getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();
    
    // Formato Prometheus
    const metrics = [
      '# HELP app_uptime_seconds Tempo de atividade da aplicação em segundos',
      '# TYPE app_uptime_seconds gauge',
      `app_uptime_seconds ${uptime}`,
      '',
      '# HELP nodejs_memory_heap_used_bytes Memória heap utilizada em bytes',
      '# TYPE nodejs_memory_heap_used_bytes gauge',
      `nodejs_memory_heap_used_bytes ${memoryUsage.heapUsed}`,
      '',
      '# HELP nodejs_memory_heap_total_bytes Memória heap total em bytes',
      '# TYPE nodejs_memory_heap_total_bytes gauge',
      `nodejs_memory_heap_total_bytes ${memoryUsage.heapTotal}`,
      '',
      '# HELP nodejs_memory_external_bytes Memória externa em bytes',
      '# TYPE nodejs_memory_external_bytes gauge',
      `nodejs_memory_external_bytes ${memoryUsage.external}`,
      '',
      '# HELP nodejs_memory_rss_bytes Memória RSS em bytes',
      '# TYPE nodejs_memory_rss_bytes gauge',
      `nodejs_memory_rss_bytes ${memoryUsage.rss}`,
      '',
    ];

    return metrics.join('\n');
  }

  @Get('json')
  @ApiOperation({ 
    summary: 'Métricas em formato JSON',
    description: 'Retorna métricas de uso e performance da aplicação em formato JSON'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas em formato JSON',
    schema: {
      example: {
        uptime: 3600,
        timestamp: '2025-11-22T01:23:00.000Z',
        memory: {
          heapUsed: 45678912,
          heapTotal: 67108864,
          external: 1234567,
          rss: 89012345
        },
        nodeVersion: 'v18.0.0'
      }
    }
  })
  getMetricsJson() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime,
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      nodeVersion: process.version,
    };
  }
}
