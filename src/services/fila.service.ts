import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  ConnectionState,
  proto,
} from '@whiskeysockets/baileys';
import PQueue from 'p-queue';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tipo de retorno para envio de mensagem WhatsApp
 */
export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  timestamp?: number;
  error?: string;
}

/**
 * FilaService - Wrapper para Baileys com enfileiramento e persistência
 * 
 * Funcionalidades:
 * - Gerenciamento de conexão WhatsApp via Baileys
 * - Enfileiramento serializado com PQueue (evita rate limits)
 * - Persistência de sessão/auth em disco
 * - Reconexão automática
 */
@Injectable()
export class FilaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FilaService.name);
  private socket: WASocket | null = null;
  private queue: PQueue;
  private authPath: string;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;

  constructor(private readonly configService: ConfigService) {
    // PQueue com concorrência 1 (serializado) para evitar rate limits
    this.queue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 });
    
    this.authPath = this.configService.get<string>(
      'WHATSAPP_AUTH_PATH',
      path.join(process.cwd(), 'whatsapp-auth')
    );

    // Garantir que o diretório de auth existe
    if (!fs.existsSync(this.authPath)) {
      fs.mkdirSync(this.authPath, { recursive: true });
      this.logger.log(`Diretório de auth criado: ${this.authPath}`);
    }
  }

  async onModuleInit() {
    this.logger.log('Inicializando FilaService (Baileys)...');
    await this.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Encerrando FilaService...');
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
    }
    await this.queue.onIdle();
  }

  private async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

      // WARNING: QR code in terminal exposes auth info in logs
      // Only enable in development or use secure auth flow in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: isDevelopment, // Only print QR in development
        logger: {
          level: 'error', // Reduzir logs verbosos do Baileys
          debug: () => {},
          info: () => {},
          warn: (msg: any) => this.logger.warn(msg),
          error: (msg: any) => this.logger.error(msg),
          fatal: (msg: any) => this.logger.error(msg),
          trace: () => {},
        } as any,
      });

      // Handler de atualização de credenciais
      this.socket.ev.on('creds.update', saveCreds);

      // Handler de atualização de conexão
      this.socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('QR Code gerado. Escaneie com WhatsApp.');
        }

        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect = 
            (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;

          this.logger.warn(`Conexão fechada. Reconectar: ${shouldReconnect}`);

          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.logger.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => this.connect(), 5000);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Máximo de tentativas de reconexão atingido.');
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.logger.log('Conexão WhatsApp estabelecida com sucesso!');
        }
      });

      // Handler de mensagens recebidas (opcional, para logs)
      this.socket.ev.on('messages.upsert', (messageUpdate) => {
        if (messageUpdate.type === 'notify') {
          this.logger.debug(`Mensagens recebidas: ${messageUpdate.messages.length}`);
        }
      });

    } catch (error: any) {
      this.logger.error(`Erro ao conectar com WhatsApp: ${error?.message || 'Unknown error'}`, error?.stack);
      
      // Tentar reconectar após 10 segundos
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 10000);
      }
    }
  }

  /**
   * Enfileira e envia mensagem WhatsApp
   */
  async sendMessage(to: string, message: string): Promise<WhatsAppSendResult> {
    if (!this.isConnected || !this.socket) {
      return {
        success: false,
        error: 'WhatsApp não está conectado. Aguarde a conexão ou escaneie o QR Code.'
      };
    }

    const result = await this.queue.add(async () => {
      try {
        // Normalizar número de telefone para formato Baileys (sem + e com @s.whatsapp.net)
        const jid = to.replace(/[^\d]/g, '') + '@s.whatsapp.net';

        this.logger.log(`Enviando mensagem para ${jid}...`);
        
        const sendResult = await this.socket!.sendMessage(jid, { text: message });
        
        this.logger.log(`Mensagem enviada com sucesso para ${jid}`);
        return {
          success: true,
          messageId: sendResult?.key?.id,
          timestamp: Date.now()
        };
      } catch (error: any) {
        this.logger.error(`Erro ao enviar mensagem para ${to}: ${error?.message || 'Unknown error'}`, error?.stack);
        return {
          success: false,
          error: error?.message || 'Unknown error'
        };
      }
    });

    return result as WhatsAppSendResult;
  }

  /**
   * Verifica se o serviço está conectado
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Retorna informações de saúde do serviço
   */
  getHealthInfo(): { connected: boolean; queueSize: number; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      queueSize: this.queue.size + this.queue.pending,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
