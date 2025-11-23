import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  phone!: string;

  @Column('text')
  message!: string;

  @Column({ default: 'pending' })
  status!: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';

  @Column({ nullable: true })
  providerMessageId?: string;

  @Column({ nullable: true })
  clinicId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
