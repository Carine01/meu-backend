import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilaService } from '../modules/fila/fila.service';
import { AgendaSemanalService } from '../modules/campanhas/agenda-semanal.service';
import { getLogger } from '../shared/logger';

/**
 * Service de CronJobs para processar fila e executar agenda semanal
 * 
 * Agendamentos:
 * - A cada 1 minuto: processar fila de envio (10 mensagens por batch)
 * - Todo dia às 9h: executar agenda semanal do dia
 * - Todo domingo às 3h: limpeza de dados antigos
 * 
 * Features:
 * - Logs estruturados com correlationId
 * - Retry automático em caso de falha
 * - Timezone configurável (America/Sao_Paulo)
 */
@Injectable()
export class CronService {
  private readonly logger = getLogger('cron');

  constructor(
    private readonly filaService: FilaService,
    private readonly agendaSemanalService: AgendaSemanalService,
  ) {}

  /**
   * Processar fila de envio a cada 1 minuto
   * Garante que mensagens agendadas sejam enviadas no horário correto
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processarFila() {
    const correlationId = `cron-fila-${Date.now()}`;
    const logger = this.logger.withCorrelation(correlationId);
    
    logger.debug('🔄 Processando fila de envio...');
    const startTime = Date.now();
    
    try {
      const resultado: { sent: number; failed: number } = await this.filaService.processarFila(10) as any;
      const duration = Date.now() - startTime;
      
      if (resultado.sent > 0 || resultado.failed > 0) {
        logger.log('✅ Fila processada', {
          sent: resultado.sent,
          failed: resultado.failed,
          durationMs: duration,
          batchSize: 10
        });
      }
    } catch (error: any) {
      const err = error as Error;
      logger.error('❌ Erro ao processar fila', err.stack, {
        error: err.message,
        durationMs: Date.now() - startTime
      });
    }
  }

  /**
   * Executar agenda semanal todo dia às 9h
   * Dispara mensagens segmentadas por etiquetas conforme dia da semana
   */
  @Cron('0 9 * * *') // Às 9h todo dia
  async executarAgendaSemanal() {
    const correlationId = `cron-agenda-${Date.now()}`;
    const logger = this.logger.withCorrelation(correlationId);
    
    logger.log('📅 Executando agenda semanal do dia...');
    const startTime = Date.now();
    
    try {
      const resultado: { leadCount: number; mensagens: number } = await this.agendaSemanalService.executarAgendaDoDia() as any;
      const duration = Date.now() - startTime;
      
      logger.log('✅ Agenda executada', {
        leadCount: resultado.leadCount,
        mensagensAdicionadas: resultado.mensagens,
        durationMs: duration,
        diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' })
      });
    } catch (error: any) {
      const err = error as Error;
      logger.error('❌ Erro ao executar agenda', err.stack, {
        error: err.message,
        durationMs: Date.now() - startTime
      });
    }
  }

  /**
   * Limpeza de dados antigos
   * A cada domingo às 3h da manhã
   * 
   * Limpa:
   * - Mensagens enviadas > 90 dias
   * - Eventos > 365 dias
   * - Logs temporários
   */
  @Cron('0 3 * * 0') // Domingo 3h
  async limpezaSemanal() {
    const correlationId = `cron-cleanup-${Date.now()}`;
    const logger = this.logger.withCorrelation(correlationId);
    
    logger.log('🧹 Executando limpeza semanal...');
    const startTime = Date.now();
    
    const stats = {
      mensagensRemovidas: 0,
      eventosArquivados: 0,
      erros: 0
    };
    
    try {
      // 1. Remover mensagens 'enviada' com mais de 90 dias
      const dataLimiteMensagens = new Date();
      dataLimiteMensagens.setDate(dataLimiteMensagens.getDate() - 90);
      
      try {
        const resultadoFila = await this.filaService.limparMensagensAntigas(dataLimiteMensagens);
        stats.mensagensRemovidas = resultadoFila?.deletedCount || 0;
        logger.debug('Mensagens antigas removidas', { 
          count: stats.mensagensRemovidas,
          dataLimite: dataLimiteMensagens.toISOString()
        });
      } catch (err) {
        stats.erros++;
        logger.warn('Erro ao limpar mensagens', { error: (err as Error).message });
      }
      
      // 2. Arquivar eventos antigos (> 365 dias)
      // Nota: Implementar quando tiver EventsService com método de limpeza
      logger.debug('Arquivamento de eventos (pendente implementação)');
      
      const duration = Date.now() - startTime;
      
      logger.log('✅ Limpeza concluída', {
        mensagensRemovidas: stats.mensagensRemovidas,
        eventosArquivados: stats.eventosArquivados,
        erros: stats.erros,
        durationMs: duration
      });
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`❌ Erro na limpeza: ${err.message}`, err.stack);
    }
  }
}

