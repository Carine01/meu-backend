/**
 * Interface para provider de WhatsApp
 * Permite trocar entre Baileys (MVP) e WhatsApp Business API (produção)
 */

export interface WhatsAppProvider {
  /**
   * Envia mensagem de texto
   */
  sendMessage(to: string, message: string): Promise<string>;

  /**
   * Envia mensagem com mídia (imagem, PDF, etc)
   */
  sendMedia(to: string, mediaUrl: string, caption?: string): Promise<string>;

  /**
   * Envia template aprovado (apenas API oficial)
   */
  sendTemplate(to: string, templateName: string, params: any[]): Promise<string>;

  /**
   * Verifica status de mensagem
   */
  getMessageStatus(messageId: string): Promise<MessageStatus>;

  /**
   * Verifica se número tem WhatsApp
   */
  checkNumber(phoneNumber: string): Promise<boolean>;
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface SendMessageResult {
  messageId: string;
  status: MessageStatus;
  timestamp: Date;
}

