import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
} from '@whiskeysockets/baileys';
import PQueue from 'p-queue';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FilaService - Baileys WhatsApp wrapper with session persistence and queueing
 * Handles connection, authentication, and message queueing to avoid rate limits
 */
@Injectable()
export class FilaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FilaService.name);
  private socket: WASocket | null = null;
  private queue: PQueue;
  private authPath: string;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    // Initialize queue with concurrency 1 to serialize message sending
    this.queue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 });
    
    // Get auth path from config or use default
    this.authPath = this.configService.get<string>('WHATSAPP_AUTH_PATH') || 
                    path.join(process.cwd(), 'auth_info_baileys');
    
    // Ensure auth directory exists
    if (!fs.existsSync(this.authPath)) {
      fs.mkdirSync(this.authPath, { recursive: true });
      this.logger.log(`Created auth directory: ${this.authPath}`);
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing FilaService (Baileys)...');
    await this.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Destroying FilaService...');
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
    }
  }

  private async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
      
      // Only print QR in development/non-production environments
      const printQR = this.configService.get<string>('NODE_ENV') !== 'production';
      
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: printQR,
        logger: {
          level: 'silent',
          error: () => {},
          warn: () => {},
          info: () => {},
          debug: () => {},
          trace: () => {},
          child: () => ({} as any),
        } as any,
      });

      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.warn('QR Code generated. Please scan to authenticate.');
        }

        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = 
            (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          this.logger.warn(`Connection closed. Should reconnect: ${shouldReconnect}`);
          
          if (shouldReconnect && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 5000);
          } else if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            this.logger.error('Max reconnect attempts reached. Please restart service.');
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.logger.log('WhatsApp connection established successfully!');
        }
      });

    } catch (error: any) {
      this.logger.error(`Failed to connect: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a WhatsApp message through the queue
   * @param to - Phone number in international format (e.g., +5511999999999)
   * @param message - Message content
   * @returns Promise with send result
   */
  async sendMessage(to: string, message: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.queue.add(async () => {
      try {
        if (!this.socket || !this.isConnected) {
          throw new Error('WhatsApp not connected. Please check authentication.');
        }

        // Normalize phone number (remove all non-digits and format for Baileys)
        const normalized = to.replace(/\D/g, '');
        
        // Validate normalized number (should be 10-15 digits)
        if (normalized.length < 10 || normalized.length > 15) {
          throw new Error(`Invalid phone number format: ${to}`);
        }
        
        const jid = normalized + '@s.whatsapp.net';

        await this.socket.sendMessage(jid, { text: message });
        
        this.logger.log(`Message sent successfully to ${to}`);
        return { success: true };
      } catch (error: any) {
        this.logger.error(`Failed to send message to ${to}: ${error.message}`, error.stack);
        return { success: false, error: error.message };
      }
    });
    
    return result || { success: false, error: 'Queue processing failed' };
  }

  /**
   * Check connection health
   */
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
