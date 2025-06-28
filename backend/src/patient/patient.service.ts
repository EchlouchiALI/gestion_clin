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

  async findAll(): Promise<Patient[]> {
    return this.patientRepo.find({ relations: ['medecin'] });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepo.findOne({ where: { id }, relations: ['medecin'] });
    if (!patient) throw new NotFoundException('Patient introuvable');
    return patient;
  }

  async create(data: Partial<Patient>, medecinId: number): Promise<Patient> {
    const medecin = await this.medecinRepo.findOneBy({ id: medecinId });
    if (!medecin) throw new NotFoundException('Médecin introuvable');

    const newPatient = this.patientRepo.create({
      ...data,
      medecin, // liaison
    });

    return await this.patientRepo.save(newPatient);
  }

  async update(id: number, data: Partial<Patient>): Promise<Patient> {
    const patient = await this.patientRepo.findOneBy({ id });
    if (!patient) throw new NotFoundException('Patient introuvable');

    Object.assign(patient, data);
    return await this.patientRepo.save(patient);
  }

  async delete(id: number): Promise<void> {
    const result = await this.patientRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Patient introuvable');
    }
  }
}
