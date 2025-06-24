import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Medecin } from '../medecins/medecin.entity';

@Entity()
export class RendezVous {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  heure: string;

  @Column()
  motif: string;

  @Column({ default: 'à venir' })
  statut: 'à venir' | 'passé' | 'annulé';

  @ManyToOne(() => User, (u) => u.rendezvous, { eager: true })
  patient: User;

  @ManyToOne(() => Medecin, (m) => m.rendezvous, { eager: true })
  medecin: Medecin;
}
