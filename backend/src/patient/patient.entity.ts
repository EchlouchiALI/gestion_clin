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
  @Column({ type: 'text', nullable: true })
maladiesConnues?: string

@Column({ type: 'text', nullable: true })
traitementsEnCours?: string

@Column({ type: 'text', nullable: true })
allergies?: string

@Column({ type: 'text', nullable: true })
antecedentsMedicaux?: string

  @ManyToOne(() => Medecin, (medecin) => medecin.patients, {
    nullable: true,
    onDelete: 'CASCADE', // ✅ suppression en cascade si le médecin est supprimé
  })
  medecin: Medecin;

  @OneToMany(() => Ordonnance, (ordonnance) => ordonnance.patient)
  ordonnances: Ordonnance[];

  @OneToMany(() => RendezVous, (rdv) => rdv.patient)
  rendezvous: RendezVous[];
}
