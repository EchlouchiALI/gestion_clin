import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

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
  statut: 'à venir' | 'passé' | 'annulé'; // ✅ Correction ici (pas deux fois)

  @Column({ nullable: true })
  notes?: string; // ✅ Champ optionnel pour ajouter une note du médecin

  // ✅ Lien vers le patient
  @ManyToOne(() => User, (u) => u.rendezvousEnTantQuePatient, {
    eager: true,
    onDelete: 'CASCADE',
  })
  patient: User;

  // ✅ Lien vers le médecin (qui est aussi un User)
  @ManyToOne(() => User, (u) => u.rendezvousEnTantQueMedecin, {
    eager: true,
    onDelete: 'CASCADE',
  })
  medecin: User;


}
