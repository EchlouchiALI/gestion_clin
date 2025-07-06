import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // ex: "Ordonnance créée"

  @Column()
  description: string; // ex: "Youssef Amrani"

  @CreateDateColumn()
  createdAt: Date;
}
