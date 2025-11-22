import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
