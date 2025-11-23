import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('usuarios')
@Index(['clinicId']) // Index for clinic filtering
@Index(['email']) // Index for login lookups (already unique but explicit index)
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha!: string; // bcrypt hash

  @Column()
  nome!: string;

  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;

  @Column('simple-array')
  roles!: string[]; // ['user', 'admin', 'manager']

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

