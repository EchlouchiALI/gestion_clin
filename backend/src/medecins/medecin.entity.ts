import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { RendezVous } from '../rendezvous/rendezvous.entity'

@Entity()
export class Medecin {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nom: string

  @Column()
  prenom: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  specialite?: string

  @Column({ nullable: true })
  telephone?: string

  // Relation inverse vers RendezVous
  @OneToMany(() => RendezVous, (rendezvous) => rendezvous.medecin)
  rendezvous: RendezVous[]
}
