import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppProvider, MessageStatus, SendMessageResult } from './whatsapp-provider.interface';
import { WhatsAppMessage } from '../../entities/whatsapp-message.entity';
import { FilaService } from '../fila/fila.service';

/**
 * Service principal que abstrai o provider de WhatsApp
 * Troca entre Baileys (MVP) e API oficial conforme configuração
 * Agora com persistência de mensagens e integração com FilaService
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @Inject('WHATSAPP_PROVIDER')
    private readonly provider: WhatsAppProvider,
    private readonly configService: ConfigService,
    @InjectRepository(WhatsAppMessage)
    private readonly messageRepository: Repository<WhatsAppMessage>,
    @Inject(FilaService)
    private readonly filaService: FilaService,
  ) {
    this.logger.log(`🔌 WhatsApp provider: ${this.configService.get('WHATSAPP_PROVIDER', 'baileys')}`);
  }

  /**
   * Envia mensagem de texto com persistência
   * @param to - Telefone destinatário E.164
   * @param message - Texto da mensagem
   * @param clinicId - ID da clínica (multitenancy)
   * @param userId - ID do usuário que enviou (opcional, para auditoria)
   * @param metadata - Metadados adicionais (opcional)
   */
  async sendTextMessage(
    to: string, 
    message: string,
    clinicId: string = 'ELEVARE_MAIN',
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<SendMessageResult> {
    // Criar registro de auditoria ANTES do envio
    const messageRecord = new WhatsAppMessage();
    messageRecord.to = to;
    messageRecord.message = message;
    messageRecord.clinicId = clinicId;
    messageRecord.userId = userId;
    messageRecord.metadata = metadata;
    messageRecord.provider = this.configService.get('WHATSAPP_PROVIDER', 'baileys');
    messageRecord.status = 'pending';

    this.logger.debug(`Enviando mensagem de texto`, { 
      to, 
      messageLength: message.length,
      clinicId,
      messageId: messageRecord.id,
    });
    
    try {
      // Salvar com status 'pending'
      await this.messageRepository.save(messageRecord);

      // Tentar enviar via provider
      const providerMessageId = await this.provider.sendMessage(to, message);
      
      // Atualizar status para 'sent'
      messageRecord.status = 'sent';
      messageRecord.messageId = providerMessageId;
      messageRecord.attempts = 1;
      await this.messageRepository.save(messageRecord);

      this.logger.log(`✅ Mensagem enviada com sucesso`, {
        messageId: messageRecord.id,
        providerMessageId,
        to,
        clinicId,
        status: MessageStatus.SENT,
        provider: messageRecord.provider,
      });
      
      return {
        messageId: providerMessageId,
        status: MessageStatus.SENT,
        timestamp: new Date(),
      };
    } catch (error: any) {
      // Atualizar status para 'failed'
      messageRecord.status = 'failed';
      messageRecord.errorMessage = error.message;
      messageRecord.attempts = (messageRecord.attempts || 0) + 1;
      await this.messageRepository.save(messageRecord);

      this.logger.error(`Erro ao enviar mensagem: ${error.message}`, {
        messageId: messageRecord.id,
        to,
        clinicId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Envia mídia (imagem, PDF, etc)
   */
  async sendMediaMessage(to: string, mediaUrl: string, caption?: string): Promise<SendMessageResult> {
    const messageId = await this.provider.sendMedia(to, mediaUrl, caption);
    
    return {
      messageId,
      status: MessageStatus.SENT,
      timestamp: new Date(),
    };
  }

  /**
   * Envia template aprovado (WhatsApp Business API)
   */
  async sendTemplateMessage(to: string, templateName: string, params: any[]): Promise<SendMessageResult> {
    const messageId = await this.provider.sendTemplate(to, templateName, params);
    
    return {
      messageId,
      status: MessageStatus.SENT,
      timestamp: new Date(),
    };
  }

  /**
   * Verifica status de mensagem
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    return this.provider.getMessageStatus(messageId);
  }

  /**
   * Verifica se número tem WhatsApp
   */
  async isWhatsAppNumber(phoneNumber: string): Promise<boolean> {
    return this.provider.checkNumber(phoneNumber);
  }

  /**
   * Envia mensagem com retry automático
   */
  async sendWithRetry(to: string, message: string, maxRetries = 3): Promise<SendMessageResult> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Tentativa ${attempt}/${maxRetries} para ${to}`, {
          attempt,
          maxRetries,
          to,
          backoffMs: attempt > 1 ? 2000 * (attempt - 1) : 0,
        });
        return await this.sendTextMessage(to, message);
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Tentativa ${attempt} falhou: ${error.message}`, {
          attempt,
          maxRetries,
          to,
          error: error.message,
        });
        
        if (attempt < maxRetries) {
          await this.sleep(2000 * attempt); // Backoff exponencial
        }
      }
    }

    this.logger.error(`❌ Falha definitiva após ${maxRetries} tentativas`, {
      to,
      maxRetries,
      lastError: lastError?.message,
    });

    throw new Error(`Falha ao enviar mensagem após ${maxRetries} tentativas: ${lastError?.message || 'erro desconhecido'}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enfileira mensagem para envio via FilaService
   * Útil para campanhas em massa com agendamento
   * 
   * @param leadId - ID do lead destinatário
   * @param leadNome - Nome do destinatário
   * @param leadTelefone - Telefone E.164
   * @param mensagemKey - Chave da mensagem da biblioteca
   * @param variaveisExtras - Variáveis adicionais para interpolar
   * @param scheduledFor - Data/hora agendada (opcional)
   * @param clinicId - ID da clínica
   */
  async enqueueMessage(
    leadId: string,
    leadNome: string,
    leadTelefone: string,
    mensagemKey: string,
    variaveisExtras: Record<string, string | number> = {},
    scheduledFor?: Date,
    clinicId: string = 'ELEVARE_MAIN',
  ): Promise<any> {
    this.logger.log(`Enfileirando mensagem: ${mensagemKey} para ${leadNome}`, {
      leadId,
      mensagemKey,
      clinicId,
      scheduledFor: scheduledFor?.toISOString(),
    });

    return this.filaService.adicionarNaFila(
      leadId,
      leadNome,
      leadTelefone,
      mensagemKey,
      variaveisExtras,
      scheduledFor,
      clinicId,
    );
  }

  /**
   * Busca mensagens por clinicId (para auditoria/relatórios)
   * 
   * @param clinicId - ID da clínica
   * @param limit - Quantidade máxima de resultados
   * @param status - Filtrar por status (opcional)
   */
  async getMessagesByClinicId(
    clinicId: string,
    limit: number = 50,
    status?: WhatsAppMessage['status'],
  ): Promise<WhatsAppMessage[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.clinicId = :clinicId', { clinicId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (status) {
      query.andWhere('message.status = :status', { status });
    }

    return query.getMany();
  }

  /**
   * Estatísticas de envio por clínica
   */
  async getClinicStats(clinicId: string): Promise<Record<string, number>> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('message.clinicId = :clinicId', { clinicId })
      .groupBy('message.status')
      .getRawMany();

    const stats: Record<string, number> = {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    messages.forEach((row: any) => {
      stats[row.status] = parseInt(row.count, 10);
      stats.total += parseInt(row.count, 10);
    });

    return stats;
  }
}

