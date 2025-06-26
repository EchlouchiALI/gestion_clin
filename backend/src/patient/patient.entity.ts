import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Medecin } from '../medecins/medecin.entity';
import { Ordonnance } from '../ordonnances/ordonnance.entity';
import { RendezVous } from '../rendezvous/rendezvous.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  dateNaissance?: string;

  @ManyToOne(() => Medecin, (medecin) => medecin.patients, { nullable: true })
  medecin: Medecin;

  @OneToMany(() => Ordonnance, (ordonnance) => ordonnance.patient)
  ordonnances: Ordonnance[];

  @OneToMany(() => RendezVous, (rdv) => rdv.patient)
  rendezvous: RendezVous[];
}
