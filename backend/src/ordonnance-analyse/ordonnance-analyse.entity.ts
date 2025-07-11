import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class OrdonnanceAnalyse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  texteOriginal: string;

  @Column({ type: 'text' })
  texteAnalyse: string;

  @CreateDateColumn()
  date: Date;
}
