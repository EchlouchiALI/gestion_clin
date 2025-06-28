import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { Medecin } from '../medecins/medecin.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,
  ) {}

  // 🔎 Obtenir tous les patients avec leur médecin
  async findAll(): Promise<Patient[]> {
    return this.patientRepo.find({ relations: ['medecin'] });
  }

  // 🔎 Obtenir un patient par ID, avec le médecin associé
  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['medecin'], // ⚠️ Nécessaire pour vérifier les droits du médecin
    });

    if (!patient) {
      throw new NotFoundException('Patient introuvable');
    }

    return patient;
  }

  // ➕ Créer un nouveau patient associé à un médecin
  async create(data: Partial<Patient>, medecinId: number): Promise<Patient> {
    const medecin = await this.medecinRepo.findOneBy({ id: medecinId });
    if (!medecin) {
      throw new NotFoundException('Médecin introuvable');
    }

    const newPatient = this.patientRepo.create({
      ...data,
      medecin,
    });

    return this.patientRepo.save(newPatient);
  }

  // ✏️ Modifier un patient existant (après vérification dans le contrôleur)
  async update(id: number, data: Partial<Patient>): Promise<Patient> {
    const patient = await this.findOne(id); // 🔁 inclut déjà medecin
    Object.assign(patient, data);
    return this.patientRepo.save(patient);
  }

  // 🗑️ Supprimer un patient (vérification faite avant dans le contrôleur)
  async delete(id: number): Promise<void> {
    const patient = await this.findOne(id); // 🔁 vérifie existence et relations

    const result = await this.patientRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Patient introuvable');
    }
  }
}
