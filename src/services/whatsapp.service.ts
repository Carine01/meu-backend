import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilaService } from './fila.service';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';

/**
 * WhatsAppService - Business logic for WhatsApp messaging with clinicId filtering
 * Handles message persistence, validation, and delegation to FilaService
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private messages: Map<string, WhatsAppMessage> = new Map();

  constructor(
    private readonly filaService: FilaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send WhatsApp message with clinicId filtering
   * @param dto - SendWhatsAppDto with to, message, and optional clinicId
   * @param clinicIdHeader - clinicId from x-clinic-id header
   * @returns Created WhatsAppMessage entity
   */
  async sendMessage(
    dto: SendWhatsAppDto,
    clinicIdHeader?: string,
  ): Promise<WhatsAppMessage> {
    // Determine clinicId: prefer header, fallback to body, then default
    const clinicId =
      clinicIdHeader ||
      dto.clinicId ||
      this.configService.get<string>('DEFAULT_CLINIC') ||
      'default';

    this.logger.log(`Sending WhatsApp message for clinicId: ${clinicId}`);

    // Create message entity
    const message = new WhatsAppMessage({
      id: this.generateId(),
      clinicId,
      to: dto.to,
      message: dto.message,
      status: 'pending',
    });

    // Persist message
    this.messages.set(message.id, message);

    // Send through FilaService
    try {
      const result = await this.filaService.sendMessage(dto.to, dto.message);

      if (result.success) {
        message.status = 'sent';
        message.sentAt = new Date();
        this.logger.log(`Message ${message.id} sent successfully`);
      } else {
        message.status = 'failed';
        message.failureReason = result.error;
        this.logger.error(`Message ${message.id} failed: ${result.error}`);
      }

      message.updatedAt = new Date();
      this.messages.set(message.id, message);

      return message;
    } catch (error: any) {
      message.status = 'failed';
      message.failureReason = error.message;
      message.updatedAt = new Date();
      this.messages.set(message.id, message);

      this.logger.error(`Error sending message ${message.id}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Get all messages filtered by clinicId
   * @param clinicId - Filter by clinic ID
   * @returns Array of WhatsAppMessage entities
   */
  findAll(clinicId?: string): WhatsAppMessage[] {
    const allMessages = Array.from(this.messages.values());
    
    if (clinicId) {
      return allMessages.filter(msg => msg.clinicId === clinicId);
    }
    
    return allMessages;
  }

  /**
   * Get message by ID with clinicId filtering
   * @param id - Message ID
   * @param clinicId - Filter by clinic ID for multitenancy
   * @returns WhatsAppMessage or null
   */
  findById(id: string, clinicId?: string): WhatsAppMessage | null {
    const message = this.messages.get(id);
    
    if (!message) {
      return null;
    }
    
    // If clinicId provided, ensure it matches
    if (clinicId && message.clinicId !== clinicId) {
      return null;
    }
    
    return message;
  }

  /**
   * Get connection health status
   */
  getHealthStatus() {
    const connectionStatus = this.filaService.getConnectionStatus();
    return {
      status: connectionStatus.connected ? 'connected' : 'disconnected',
      reconnectAttempts: connectionStatus.reconnectAttempts,
      messageCount: this.messages.size,
    };
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
