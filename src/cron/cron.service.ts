import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilaService } from '../modules/fila/fila.service';
import { AgendaSemanalService } from '../modules/campanhas/agenda-semanal.service';

/**
 * Service de CronJobs para processar fila e executar agenda semanal
 * 
 * Agendamentos:
 * - A cada 1 minuto: processar fila de envio (10 mensagens por batch)
 * - Todo dia às 9h: executar agenda semanal do dia
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

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
    this.logger.debug('🔄 Processando fila de envio...');
    
    try {
      const resultado: { sent: number; failed: number } = await this.filaService.processarFila(10) as any;
      
      if (resultado.sent > 0 || resultado.failed > 0) {
        this.logger.log(
          `✅ Fila processada: ${resultado.sent} enviados, ${resultado.failed} falhas`,
        );
      }
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`❌ Erro ao processar fila: ${err.message}`, err.stack);
    }
  }

  /**
   * Executar agenda semanal todo dia às 9h
   * Dispara mensagens segmentadas por etiquetas conforme dia da semana
   */
  @Cron('0 9 * * *') // Às 9h todo dia
  async executarAgendaSemanal() {
    this.logger.log('📅 Executando agenda semanal do dia...');
    
    try {
      const resultado: { leadCount: number; mensagens: number } = await this.agendaSemanalService.executarAgendaDoDia() as any;
      
      this.logger.log(
        `✅ Agenda executada: ${resultado.leadCount} leads, ${resultado.mensagens} mensagens adicionadas`,
      );
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`❌ Erro ao executar agenda: ${err.message}`, err.stack);
    }
  }

  /**
   * Limpeza de dados antigos (opcional)
   * A cada domingo às 3h da manhã
   */
  @Cron('0 3 * * 0') // Domingo 3h
  async limpezaSemanal() {
    this.logger.log('🧹 Executando limpeza semanal...');
    
    try {
      // TODO: Implementar lógica de limpeza
      // - Remover mensagens 'sent' com mais de 90 dias
      // - Arquivar eventos antigos
      // - Limpar logs obsoletos
      
      this.logger.log('✅ Limpeza concluída');
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`❌ Erro na limpeza: ${err.message}`, err.stack);
    }
  }
}

