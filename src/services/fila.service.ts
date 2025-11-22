import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import PQueue from 'p-queue';

interface QueueMessage {
  id: string;
  phone: string;
  message: string;
}

@Injectable()
export class FilaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FilaService.name);
  private sock: any;
  private queue: PQueue;
  private authPath: string;

  constructor() {
    this.authPath = process.env.WHATSAPP_AUTH_PATH || './auth_info';
    this.queue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 });
  }

  async onModuleInit() {
    await this.connectWhatsApp();
  }

  async onModuleDestroy() {
    if (this.sock) {
      await this.sock.logout();
    }
  }

  private async connectWhatsApp() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          this.logger.log(`Connection closed, reconnecting: ${shouldReconnect}`);
          if (shouldReconnect) {
            this.connectWhatsApp();
          }
        } else if (connection === 'open') {
          this.logger.log('WhatsApp connection opened');
        }
      });
    } catch (error) {
      this.logger.error(`Failed to connect WhatsApp: ${error.message}`);
    }
  }

  async enqueueMessage(msg: QueueMessage): Promise<void> {
    return this.queue.add(async () => {
      try {
        const jid = `${msg.phone}@s.whatsapp.net`;
        await this.sock.sendMessage(jid, { text: msg.message });
        this.logger.log(`Message ${msg.id} sent to ${msg.phone}`);
      } catch (error) {
        this.logger.error(`Failed to send message ${msg.id}: ${error.message}`);
        throw error;
      }
    });
  }

  getQueueStatus() {
    return {
      pending: this.queue.pending,
      size: this.queue.size,
    };
  }
}
