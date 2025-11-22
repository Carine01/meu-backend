import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('whatsapp_messages')
@Index(['clinicId'])
@Index(['phone'])
@Index(['status'])
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  clinicId: string;

  @Column()
  phone: string;

  @Column('text')
  message: string;

  @Column({ default: 'pending' })
  status: string; // pending, sent, delivered, failed

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
