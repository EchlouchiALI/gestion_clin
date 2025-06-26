import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RendezVous } from '../rendezvous/rendezvous.entity';
import { Patient } from '../patient/patient.entity'; // ✅ corriger le chemin si le dossier est bien 'patient'
import { Ordonnance } from '../ordonnances/ordonnance.entity';

@Entity()
export class Medecin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  specialite?: string;

  @Column({ nullable: true })
  telephone?: string;

  // 🩺 Relation vers les rendez-vous
  @OneToMany(() => RendezVous, (rendezvous) => rendezvous.medecin)
  rendezvous: RendezVous[];

  // 🧑‍⚕️ Relation vers les patients suivis par ce médecin
  @OneToMany(() => Patient, (patient) => patient.medecin)
  patients: Patient[];

  // 📝 Relation vers les ordonnances créées par ce médecin
  @OneToMany(() => Ordonnance, (ordonnance) => ordonnance.medecin)
  ordonnances: Ordonnance[];
}
