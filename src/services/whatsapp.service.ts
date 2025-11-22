import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FilaService } from './fila.service';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * WhatsAppService - Lógica de negócio para envio de mensagens WhatsApp
 * 
 * Responsabilidades:
 * - Validação de clinicId
 * - Persistência de mensagens (audit trail)
 * - Enfileiramento via FilaService
 * - Tratamento de erros
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  // WARNING: In-memory storage - will lose data on restart
  // TODO: Implement proper DB repository with TypeORM for production use
  private messageStore: WhatsAppMessage[] = [];

  constructor(private readonly filaService: FilaService) {}

  /**
   * Envia mensagem WhatsApp com persistência e enfileiramento
   */
  async sendMessage(dto: SendWhatsAppDto): Promise<WhatsAppMessage> {
    this.logger.log(`Enviando mensagem WhatsApp para ${dto.to} (clinicId: ${dto.clinicId})`);

    // Criar registro de mensagem (audit)
    const message: WhatsAppMessage = {
      id: this.generateId(),
      clinicId: dto.clinicId,
      to: dto.to,
      message: dto.message,
      status: 'pending',
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Persistir mensagem (status: pending)
    this.messageStore.push(message);

    try {
      // Enfileirar envio via Baileys
      const result = await this.filaService.sendMessage(dto.to, dto.message);

      if (result) {
        // Atualizar status para 'sent'
        message.status = 'sent';
        message.sentAt = new Date();
        message.updatedAt = new Date();
        
        this.logger.log(`Mensagem enviada com sucesso (id: ${message.id})`);
      }
    } catch (error: any) {
      // Atualizar status para 'failed'
      message.status = 'failed';
      message.error = error?.message || 'Unknown error';
      message.updatedAt = new Date();
      
      this.logger.error(`Falha ao enviar mensagem (id: ${message.id}): ${error?.message || 'Unknown error'}`);
      
      throw new HttpException(
        `Falha ao enviar mensagem WhatsApp: ${error?.message || 'Unknown error'}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return message;
  }

  /**
   * Busca mensagens por clinicId (exemplo de filtro multitenancy)
   */
  async findByClinicId(clinicId: string): Promise<WhatsAppMessage[]> {
    this.logger.log(`Buscando mensagens para clinicId: ${clinicId}`);
    return this.messageStore.filter(msg => msg.clinicId === clinicId);
  }

  /**
   * Busca mensagens por status e clinicId
   */
  async findByStatusAndClinicId(
    status: WhatsAppMessage['status'],
    clinicId: string
  ): Promise<WhatsAppMessage[]> {
    this.logger.log(`Buscando mensagens com status '${status}' para clinicId: ${clinicId}`);
    return this.messageStore.filter(
      msg => msg.status === status && msg.clinicId === clinicId
    );
  }

  /**
   * Retorna estatísticas por clinicId
   */
  async getStatsByClinicId(clinicId: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    failed: number;
  }> {
    const messages = await this.findByClinicId(clinicId);
    
    return {
      total: messages.length,
      pending: messages.filter(m => m.status === 'pending').length,
      sent: messages.filter(m => m.status === 'sent').length,
      delivered: messages.filter(m => m.status === 'delivered').length,
      failed: messages.filter(m => m.status === 'failed').length,
    };
  }

  /**
   * Verifica saúde do serviço
   */
  async getHealth() {
    const filaHealth = this.filaService.getHealthInfo();
    
    return {
      status: filaHealth.connected ? 'ok' : 'disconnected',
      connection: filaHealth.connected ? 'connected' : 'disconnected',
      info: {
        queueSize: filaHealth.queueSize,
        reconnectAttempts: filaHealth.reconnectAttempts,
        totalMessages: this.messageStore.length,
      },
    };
  }

  /**
   * Gera ID único para mensagem usando UUID v4
   */
  private generateId(): string {
    return uuidv4();
  }
}
