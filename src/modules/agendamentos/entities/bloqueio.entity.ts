import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bloqueios')
export class Bloqueio {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;

  @Column()
  data!: string; // YYYY-MM-DD

  @Column({ nullable: true })
  startTime?: string; // HH:mm

  @Column({ nullable: true })
  endTime?: string; // HH:mm

  @Column({ 
    type: 'enum', 
    enum: ['almoco', 'feriado', 'sabado', 'intervalo', 'personalizado'], 
    default: 'personalizado' 
  })
  tipo!: 'almoco' | 'feriado' | 'sabado' | 'intervalo' | 'personalizado';

  @Column({ nullable: true })
  motivo?: string;

  @Column({ default: false })
  recorrente!: boolean; // Repete toda semana/mês

  @Column({ nullable: true })
  ateData?: string; // Data final para bloqueios recorrentes

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    this.id = `BLK${Date.now()}`;
  }
}

