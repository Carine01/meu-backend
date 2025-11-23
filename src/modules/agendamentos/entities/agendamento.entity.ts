import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;

  @Column()
  nomePaciente!: string;

  @Column()
  telefoneE164!: string;

  @Column()
  procedimento!: string;

  @Column()
  startISO!: string; // ISO 8601 timestamp

  @Column({ default: 60 })
  duracaoMinutos!: number;

  @Column({ 
    type: 'enum', 
    enum: ['agendado', 'confirmado', 'compareceu', 'no-show', 'cancelado'], 
    default: 'agendado' 
  })
  status!: 'agendado' | 'confirmado' | 'compareceu' | 'no-show' | 'cancelado';

  @Column({ nullable: true })
  observacoes?: string;

  @Column({ nullable: true })
  leadId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Removido construtor para evitar inicialização duplicada, propriedades obrigatórias já usam '!'.
}

