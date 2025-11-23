import { Injectable, Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';

@Injectable()
export class FilaService {
  private queue = new PQueue({ concurrency: 1 });
  private logger = new Logger('FilaService');

  constructor(@InjectRepository(WhatsAppMessage) private repo: Repository<WhatsAppMessage>) {}

  async enqueueSend(phone: string, message: string, clinicId?: string) {
    const msg = this.repo.create({ phone, message, status: 'pending', clinicId });
    const saved = await this.repo.save(msg);
    this.queue.add(() => this.processMessage(saved.id));
    return saved;
  }

  private async processMessage(id: string) {
    const msg = await this.repo.findOneBy({ id });
    if (!msg) return;
    try {
      // Aqui chama provider real (Baileys/HTTP). Abstraia em provider real em código de produção.
      // Simulação de envio:
      this.logger.log(`Enviando para ${msg.phone}`);
      // TODO: usar WhatsAppProvider.send(...)
      msg.status = 'sent';
      msg.providerMessageId = `sim-${Date.now()}`;
      await this.repo.save(msg);
    } catch (e) {
      this.logger.error(e);
      msg.status = 'failed';
      await this.repo.save(msg);
    }
  }
}
