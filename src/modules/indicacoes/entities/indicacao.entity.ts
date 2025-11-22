import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('indicacoes')
export class Indicacao {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  indicadorId!: string; // Lead que fez a indicação

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string; // Isolamento por clínica

  @Column()
  nomeIndicado!: string;

  @Column()
  telefoneIndicado!: string;

  @Column({ nullable: true })
  emailIndicado?: string;

  @Column({ type: 'enum', enum: ['pendente', 'contatado', 'agendado', 'compareceu', 'cancelado'], default: 'pendente' })
  status!: 'pendente' | 'contatado' | 'agendado' | 'compareceu' | 'cancelado';

  @Column({ default: 1 })
  pontosGanhos!: number; // 1 ponto por indicação, +2 bônus se comparecer

  @Column({ nullable: true })
  agendamentoId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor() {
    this.id = `IND${Date.now()}`;
    this.status = 'pendente';
    this.pontosGanhos = 1;
  }
}

