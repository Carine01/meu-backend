import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @Column({ type: 'decimal', nullable: true })
  value?: number;

  @CreateDateColumn()
  createdAt!: Date;
}
