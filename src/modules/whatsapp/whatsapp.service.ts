import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppProvider, MessageStatus, SendMessageResult } from './whatsapp-provider.interface';
import { WhatsappMessage } from './entities/whatsapp-message.entity';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Service principal que abstrai o provider de WhatsApp
 * Troca entre Baileys (MVP) e API oficial conforme configuração
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @Inject('WHATSAPP_PROVIDER')
    private readonly provider: WhatsAppProvider,
    private readonly configService: ConfigService,
    @InjectRepository(WhatsappMessage)
    private repo: Repository<WhatsappMessage>,
  ) {
    this.logger.log(`🔌 WhatsApp provider: ${this.configService.get('WHATSAPP_PROVIDER', 'baileys')}`);
  }

  /**
   * Envia mensagem de texto
   */
  async sendTextMessage(to: string, message: string): Promise<SendMessageResult> {
    this.logger.debug(`Enviando mensagem de texto`, { to, messageLength: message.length });
    
    try {
      const messageId = await this.provider.sendMessage(to, message);
      
      this.logger.log(`✅ Mensagem enviada com sucesso`, {
        messageId,
        to,
        status: MessageStatus.SENT,
        provider: this.configService.get('WHATSAPP_PROVIDER'),
      });
      
      return {
        messageId,
        status: MessageStatus.SENT,
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`, {
        to,
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

    throw new Error('Falha ao enviar mensagem após 3 tentativas');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(dto: SendMessageDto) {
    return this.repo.save({
      ...dto,
      clinicId: dto.clinicId,
    });
  }

  async listMessages(limit: number = 50, clinicId?: string) {
    const whereClause: any = {};
    if (clinicId) {
      whereClause.clinicId = clinicId;
    }
    
    return this.repo.find({
      take: limit,
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }
}

