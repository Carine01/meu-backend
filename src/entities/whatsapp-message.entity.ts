import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Entidade para auditoria e persistência de mensagens WhatsApp
 * Garante rastreabilidade e multitenancy via clinicId
 */
@Entity('whatsapp_messages')
@Index(['clinicId', 'createdAt']) // Índice composto para queries por clínica + data
export class WhatsAppMessage {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index() // Índice para filtros por clínica
  clinicId!: string;

  @Column({ type: 'varchar', length: 20 })
  to!: string; // Telefone destinatário E.164: +5511999999999

  @Column({ type: 'text' })
  message!: string; // Conteúdo da mensagem

  @Column({ type: 'varchar', length: 255, nullable: true })
  messageId?: string; // ID retornado pelo provider (Baileys/Meta)

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'], 
    default: 'pending' 
  })
  status!: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'varchar', length: 50, default: 'baileys' })
  provider!: string; // 'baileys' ou 'official'

  @Column({ type: 'text', nullable: true })
  errorMessage?: string; // Mensagem de erro se status = failed

  @Column({ type: 'int', default: 0 })
  attempts!: number; // Tentativas de envio

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId?: string; // ID do usuário que enviou (para auditoria)

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Metadados adicionais (leadId, campanhaId, etc)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor() {
    this.id = `WA${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.status = 'pending';
    this.provider = 'baileys';
    this.attempts = 0;
  }
}
