import { Module } from '@nestjs/common';
import { LeadsScoreService } from './leads-score.service';

/**
 * Módulo de Scoring de Leads
 * 
 * Funcionalidades:
 * - Cálculo de score (0-100) baseado em 35+ regras
 * - Determinação de stage (frio/morno/quente)
 * - Identificação automática de etiquetas
 * - Sugestão de próxima mensagem
 * - Cálculo de prioridade de atendimento
 * 
 * Pode ser usado por LeadsService e outros módulos
 */
@Module({
  providers: [LeadsScoreService],
  exports: [LeadsScoreService],
})
export class LeadsScoreModule {}

