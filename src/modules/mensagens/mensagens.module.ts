import { Module } from '@nestjs/common';
import { MensagemResolverService } from './mensagem-resolver.service';

/**
 * Módulo de Mensagens WhatsApp
 * 
 * Exporta:
 * - MensagemResolverService (resolução de variáveis em templates)
 * - BIBLIOTECA_MENSAGENS (119 mensagens humanizadas)
 */
@Module({
  providers: [MensagemResolverService],
  exports: [MensagemResolverService],
})
export class MensagensModule {}

