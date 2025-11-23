import { Module } from '@nestjs/common';
import { MensagemResolverService } from './mensagem-resolver.service';
import { MensagensService } from './mensagens.service';
import { MensagensRepository } from './mensagens.repository';
import { MensagensController } from './mensagens.controller';
import { PrometheusService } from '../../libs/observability/prometheus.metrics';

/**
 * Módulo de Mensagens WhatsApp
 * 
 * Exporta:
 * - MensagemResolverService (resolução de variáveis em templates)
 * - MensagensService (gestão de mensagens com multitenancy)
 * - BIBLIOTECA_MENSAGENS (119 mensagens humanizadas)
 */
@Module({
  controllers: [MensagensController],
  providers: [
    MensagemResolverService,
    MensagensService,
    {
      provide: 'IMensagensRepository',
      useClass: MensagensRepository,
    },
    PrometheusService,
  ],
  exports: [MensagemResolverService, MensagensService],
})
export class MensagensModule {}

