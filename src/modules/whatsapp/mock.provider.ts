import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppProvider, MessageStatus } from './whatsapp-provider.interface';

/**
 * Mock provider for testing and environments without WhatsApp access
 * Simulates message sending without actually connecting to WhatsApp
 */
@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);
  private messageCounter = 0;

  constructor() {
    this.logger.log('🧪 MockWhatsAppProvider initialized - No real WhatsApp connection');
  }

  async sendMessage(to: string, message: string): Promise<string> {
    this.messageCounter++;
    const messageId = `mock_msg_${Date.now()}_${this.messageCounter}`;
    
    this.logger.log(`📤 [MOCK] Message sent to ${to}`, {
      messageId,
      to,
      message: message.substring(0, 50),
      timestamp: new Date().toISOString(),
    });
    
    return messageId;
  }

  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<string> {
    this.messageCounter++;
    const messageId = `mock_media_${Date.now()}_${this.messageCounter}`;
    
    this.logger.log(`📷 [MOCK] Media sent to ${to}`, {
      messageId,
      to,
      mediaUrl,
      caption,
    });
    
    return messageId;
  }

  async sendTemplate(to: string, templateName: string, params: any[]): Promise<string> {
    this.messageCounter++;
    const messageId = `mock_template_${Date.now()}_${this.messageCounter}`;
    
    this.logger.log(`📋 [MOCK] Template sent to ${to}`, {
      messageId,
      to,
      templateName,
      params,
    });
    
    return messageId;
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    this.logger.debug(`[MOCK] Status check for ${messageId}`);
    return MessageStatus.SENT;
  }

  async checkNumber(phoneNumber: string): Promise<boolean> {
    this.logger.debug(`[MOCK] Number check for ${phoneNumber}`);
    // Simulate that all numbers have WhatsApp
    return true;
  }
}
