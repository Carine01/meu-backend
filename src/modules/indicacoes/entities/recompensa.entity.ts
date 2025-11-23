import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('recompensas')
@Index(['clinicId']) // Index for clinic filtering
export class Recompensa {
  @PrimaryColumn('uuid')
  leadId!: string;

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string; // Isolamento por clínica

  @Column({ default: 0 })
  pontosAcumulados!: number;

  @Column({ default: 0 })
  sessoesGratisDisponiveis!: number;

  @Column('simple-array')
  historicoIndicacoes!: string[]; // IDs das indicações

  @Column({ nullable: true })
  ultimaResgate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

