import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Medecin } from '../medecins/medecin.entity';
import { Patient } from '../patient/patient.entity';

@Entity()
export class Ordonnance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ type: 'text' })
  contenu: string;

  @ManyToOne(() => Medecin, medecin => medecin.ordonnances)
  medecin: Medecin;

  @ManyToOne(() => Patient, patient => patient.ordonnances)
  patient: Patient;
}
