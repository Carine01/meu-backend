import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('mensagens')
export class Mensagem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
