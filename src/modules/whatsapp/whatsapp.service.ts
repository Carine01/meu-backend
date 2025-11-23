import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppProvider, MessageStatus, SendMessageResult } from './whatsapp-provider.interface';

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
  ) {
    this.logger.log(`🔌 WhatsApp provider: ${this.configService.get('WHATSAPP_PROVIDER', 'baileys')}`);
  }

  /**
   * Envia mensagem de texto
   */
  async sendTextMessage(to: string, message: string): Promise<SendMessageResult> {
    try {
      const messageId = await this.provider.sendMessage(to, message);
      
      return {
        messageId,
        status: MessageStatus.SENT,
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
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
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Tentativa ${attempt}/${maxRetries} para ${to}`);
        return await this.sendTextMessage(to, message);
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < maxRetries) {
          await this.sleep(2000 * attempt); // Backoff exponencial
        }
      }
    }

    throw new Error('Falha ao enviar mensagem após 3 tentativas');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

