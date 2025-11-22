import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum EventType {
  // Lead lifecycle
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  STAGE_CHANGED = 'stage_changed',
  SCORE_UPDATED = 'score_updated',
  
  // Mensagens
  MESSAGE_SENT = 'message_sent',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  MESSAGE_REPLIED = 'message_replied',
  MESSAGE_FAILED = 'message_failed',
  
  // Agendamentos
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_NOSHOW = 'appointment_noshow',
  
  // Fila
  QUEUE_ADDED = 'queue_added',
  QUEUE_PROCESSED = 'queue_processed',
  QUEUE_RETRY = 'queue_retry',
  QUEUE_FAILED = 'queue_failed',
  
  // Campanhas
  CAMPAIGN_SENT = 'campaign_sent',
  CAMPAIGN_OPENED = 'campaign_opened',
  CAMPAIGN_CLICKED = 'campaign_clicked',
  
  // Indicações
  REFERRAL_CREATED = 'referral_created',
  REFERRAL_CONVERTED = 'referral_converted',
  REWARD_EARNED = 'reward_earned',
  REWARD_REDEEMED = 'reward_redeemed',
  
  // Sistema
  WEBHOOK_RECEIVED = 'webhook_received',
  ERROR_OCCURRED = 'error_occurred',
  INTEGRATION_SYNC = 'integration_sync',
}

@Entity('eventos')
@Index(['leadId', 'createdAt'])
@Index(['eventType', 'createdAt'])
@Index(['createdAt'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  @Index()
  eventType!: EventType;

  @Column({ nullable: true })
  @Index()
  leadId?: string;

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;

  @Column({ nullable: true })
  agendamentoId?: string;

  @Column({ nullable: true })
  mensagemId?: string;

  @Column({ nullable: true })
  campanhaId?: string;

  @Column({ nullable: true })
  indicacaoId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  before?: Record<string, any>; // Estado anterior (para mudanças)

  @Column({ type: 'jsonb', nullable: true })
  after?: Record<string, any>; // Estado posterior (para mudanças)

  @Column({ nullable: true })
  userId?: string; // Usuário responsável pela ação (se aplicável)

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ default: 'system' })
  source!: string; // 'system', 'user', 'webhook', 'cron', 'api'

  @CreateDateColumn()
  createdAt!: Date;

  // Virtual fields para facilitar queries
  @Column({ type: 'date', nullable: true })
  @Index()
  eventDate?: Date; // Data do evento (sem hora) para agregações

  @Column({ default: false })
  processed!: boolean; // Para eventos que precisam de processamento assíncrono
}

