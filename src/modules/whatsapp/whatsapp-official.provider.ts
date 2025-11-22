import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WhatsAppProvider, MessageStatus } from './whatsapp-provider.interface';

/**
 * Implementação para produção usando WhatsApp Business API oficial
 * Requer aprovação da Meta e configuração de webhook
 */
@Injectable()
export class WhatsAppOfficialProvider implements WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppOfficialProvider.name);
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = 'https://graph.facebook.com/v18.0';
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  async sendMessage(to: string, message: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`✅ Mensagem enviada via API oficial: ${response.data.messages[0].id}`);
      
      return response.data.messages[0].id;
    } catch (error: any) {
      this.logger.error(`Erro na API oficial: ${error.response?.data || error.message}`);
      throw error;
    }
  }

  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'image',
        image: {
          link: mediaUrl,
          caption: caption || '',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.messages[0].id;
  }

  async sendTemplate(to: string, templateName: string, params: any[]): Promise<string> {
    const components = params.map((param, index) => ({
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: param,
        },
      ],
    }));

    const response = await axios.post(
      `${this.apiUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: this.formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'pt_BR' },
          components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.messages[0].id;
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const status = response.data.status;
      
      switch (status) {
        case 'sent':
          return MessageStatus.SENT;
        case 'delivered':
          return MessageStatus.DELIVERED;
        case 'read':
          return MessageStatus.READ;
        case 'failed':
          return MessageStatus.FAILED;
        default:
          return MessageStatus.PENDING;
      }
    } catch (error: any) {
      this.logger.error(`Erro ao buscar status: ${error.message}`);
      return MessageStatus.PENDING;
    }
  }

  async checkNumber(phoneNumber: string): Promise<boolean> {
    // API oficial não fornece endpoint direto para isso
    // Alternativa: tentar enviar e verificar erro
    this.logger.warn('checkNumber não suportado pela API oficial');
    return true;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }
}

