import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bloqueios')
export class Bloqueio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
