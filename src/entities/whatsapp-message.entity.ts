/**
 * WhatsAppMessage Entity
 * Audit entity for WhatsApp messages with clinicId multitenancy support
 */
export class WhatsAppMessage {
  id!: string;
  clinicId!: string;
  to!: string;
  message!: string;
  status!: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failureReason?: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<WhatsAppMessage>) {
    this.status = partial.status || 'pending';
    this.createdAt = partial.createdAt || new Date();
    this.updatedAt = partial.updatedAt || new Date();
    Object.assign(this, partial);
  }
}
