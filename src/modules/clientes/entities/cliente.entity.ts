import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column()
    nome!: string;

  @Column()
    telefone!: string;

  @Column({ nullable: true })
  dataNascimento?: string;

  @Column({ nullable: true })
  clinicId?: string;

  @CreateDateColumn()
    createdAt!: Date;
}
