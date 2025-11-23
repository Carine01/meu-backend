import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('whatsapp_messages')
export class WhatsappMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  to!: string;

  @Column()
  message!: string;

  @Column({ nullable: false })
  clinicId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
