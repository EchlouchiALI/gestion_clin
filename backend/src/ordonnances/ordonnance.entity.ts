import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Medecin } from '../medecins/medecin.entity';
import { User } from '../users/user.entity';

@Entity()
export class Ordonnance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ type: 'text' })
  contenu: string;
  @Column({ nullable: true })
  traitements: string;

  @Column({ nullable: true })
  duree: string;

  @Column({ nullable: true })
  analyses: string;

  @ManyToOne(() => Medecin, medecin => medecin.ordonnances, { eager: true })
  medecin: Medecin;

  @ManyToOne(() => User, { eager: true })
  patient: User;
}
