import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { WhatsAppProvider, MessageStatus, SendMessageResult } from './whatsapp-provider.interface';

/**
 * Implementação MVP usando Baileys
 * Para produção, criar WhatsAppOfficialProvider
 */
@Injectable()
export class BaileysProvider implements WhatsAppProvider {
  private readonly logger = new Logger(BaileysProvider.name);
  private socket: any;
  private isConnected = false;

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: {
        level: 'silent' as any,
        child: () => this.logger as any,
        trace: (msg: any) => this.logger.verbose(msg),
        error: (msg: any) => this.logger.error(msg),
        warn: (msg: any) => this.logger.warn(msg),
        info: (msg: any) => this.logger.log(msg),
        debug: (msg: any) => this.logger.debug(msg),
      } as any,
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        this.logger.warn('Connection closed. Reconnecting...', shouldReconnect);
        
        if (shouldReconnect) {
          setTimeout(() => this.initialize(), 3000);
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.logger.log('✅ WhatsApp connected successfully');
      }
    });
  }

  async sendMessage(to: string, message: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const result = await this.socket.sendMessage(formattedNumber, { text: message });
      
      this.logger.log(`📤 Mensagem enviada para ${to}`);
      
      return result.key.id;
    } catch (error: any) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
      throw error;
    }
  }

  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    const formattedNumber = this.formatPhoneNumber(to);
    
    const result = await this.socket.sendMessage(formattedNumber, {
      image: { url: mediaUrl },
      caption: caption || '',
    });

    this.logger.log(`📷 Mídia enviada para ${to}`);
    
    return result.key.id;
  }

  async sendTemplate(to: string, templateName: string, params: any[]): Promise<string> {
    // Baileys não suporta templates - fallback para mensagem de texto
    this.logger.warn('Templates não suportados no Baileys. Enviando mensagem de texto.');
    
    const message = this.buildTemplateMessage(templateName, params);
    return this.sendMessage(to, message);
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    // Baileys não fornece status detalhado - retorna "sent" como padrão
    return MessageStatus.SENT;
  }

  async checkNumber(phoneNumber: string): Promise<boolean> {
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const [result] = await this.socket.onWhatsApp(formattedNumber);
      
      return result?.exists || false;
    } catch (error: any) {
      this.logger.error(`Erro ao verificar número: ${error.message}`);
      return false;
    }
  }

  /**
   * Formata número para padrão WhatsApp: 5511999999999@s.whatsapp.net
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}@s.whatsapp.net`;
    }
    
    return `${cleaned}@s.whatsapp.net`;
  }

  /**
   * Converte template em mensagem de texto simples
   */
  private buildTemplateMessage(templateName: string, params: any[]): string {
    // Mock - idealmente buscar template do banco
    const templates: Record<string, string> = {
      'boas_vindas': `Olá ${params[0]}! Bem-vindo à ${params[1]}!`,
      'confirmacao_agendamento': `Seu agendamento para ${params[0]} às ${params[1]} foi confirmado!`,
      'lembrete_consulta': `Lembrete: Sua consulta é amanhã às ${params[0]}.`,
    };

    return templates[templateName] || `Mensagem: ${templateName}`;
  }
}

