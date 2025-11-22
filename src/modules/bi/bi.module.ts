import { Module } from '@nestjs/common';
import { BiService } from './bi.service';
import { BiController } from './bi.controller';

/**
 * Módulo de Business Intelligence
 * 
 * Funcionalidades:
 * - Dashboard com métricas 30d/7d/hoje
 * - Métricas Prometheus (/bi/metrics)
 * - Análise de funil de conversão
 * - Performance por origem
 * - Top etiquetas
 */
@Module({
  controllers: [BiController],
  providers: [BiService],
  exports: [BiService],
})
export class BiModule {}

