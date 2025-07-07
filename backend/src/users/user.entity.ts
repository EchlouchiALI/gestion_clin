import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { RendezVous } from '../rendezvous/rendezvous.entity';
import { Dossier } from '../dossiers/dossier.entity';
import { Medecin } from 'src/medecins/medecin.entity';
import { ChatMessage } from '../../chatbot/entities/chat-message.entity' // ✅ chemin relatif


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  age: number;

  @Column()
  lieuNaissance: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'patient' })
  role: 'patient' | 'medecin' | 'admin';

  @Column({ nullable: true })
  specialite: string;

  @Column({ type: 'varchar', nullable: true })
  resetCode: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  sexe: string;

  @Column({ nullable: true })
  dateNaissance: string;

  // ✅ Relations
  @OneToMany(() => RendezVous, (rdv) => rdv.patient)
  rendezvousEnTantQuePatient: RendezVous[];

  @OneToMany(() => RendezVous, (rdv) => rdv.medecin)
  rendezvousEnTantQueMedecin: RendezVous[];

  @OneToMany(() => Dossier, (dossier) => dossier.patient)
  dossiers: Dossier[];

  @ManyToOne(() => Medecin, (medecin) => medecin.patients, { nullable: true })
  medecin: Medecin;
  @OneToMany(() => ChatMessage, msg => msg.user)
chatMessages: ChatMessage[]

}
