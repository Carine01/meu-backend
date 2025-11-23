import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Campanha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  objetivo?: string;

  @Column({ default: true })
  ativo: boolean;
}
