import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';
import { FilaService } from './fila.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectRepository(WhatsAppMessage)
    private readonly whatsappRepository: Repository<WhatsAppMessage>,
    private readonly filaService: FilaService,
  ) {}

  async sendMessage(dto: SendWhatsAppDto): Promise<WhatsAppMessage> {
    this.logger.log(`Sending message to ${dto.phone} for clinic ${dto.clinicId}`);

    // Persist message
    const message = this.whatsappRepository.create({
      clinicId: dto.clinicId,
      phone: dto.phone,
      message: dto.message,
      metadata: dto.metadata,
      status: 'pending',
    });

    const saved = await this.whatsappRepository.save(message);

    // Enqueue for sending
    try {
      await this.filaService.enqueueMessage({
        id: saved.id,
        phone: dto.phone,
        message: dto.message,
      });
      this.logger.log(`Message ${saved.id} enqueued successfully`);
    } catch (error) {
      this.logger.error(`Failed to enqueue message ${saved.id}: ${error.message}`);
      saved.status = 'failed';
      saved.error = error.message;
      await this.whatsappRepository.save(saved);
    }

    return saved;
  }

  async getMessagesByClinic(clinicId: string): Promise<WhatsAppMessage[]> {
    return this.whatsappRepository.find({
      where: { clinicId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async updateMessageStatus(id: string, status: string, messageId?: string, error?: string): Promise<void> {
    await this.whatsappRepository.update(id, {
      status,
      messageId,
      error,
    });
  }
}
