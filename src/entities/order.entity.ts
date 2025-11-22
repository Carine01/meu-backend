import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  clinicId!: string;

  @Column({ type: 'decimal', nullable: true })
  amount?: number;

  @Column({ type: 'text', nullable: true })
  status?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
