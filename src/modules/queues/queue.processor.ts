import { Injectable } from '@nestjs/common';
import { WhatsappMessage } from '../whatsapp/entities/whatsapp-message.entity';

interface Job {
  data: {
    message: string;
    to: string;
    clinicId?: string;
  };
}

@Injectable()
export class WhatsappQueueProcessor {
  
  async handleSend(job: Job) {
    const { message, to } = job.data;
    const clinicId = job.data.clinicId;

    return {
      status: 'queued',
      message,
      to,
      clinicId,
    };
  }
}
