import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('campanhas')
export class Campanha {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
