import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tipo!: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data!: Date;
}
