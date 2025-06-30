import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medecin } from '../medecins/medecin.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ✅ Obtenir tous les patients liés à un médecin
  async findByMedecinId(medecinId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: 'patient',
        medecin: { id: medecinId } as any, // ⚠️ "as any" pour contourner TS si besoin
      },
      relations: ['medecin'],
    });
  }

  // ✅ Obtenir un patient par ID
  async findOne(id: number): Promise<User> {
    const patient = await this.userRepository.findOne({
      where: { id, role: 'patient' },
      relations: ['medecin'],
    });

    if (!patient) {
      throw new NotFoundException('Patient introuvable');
    }

    return patient;
  }

  // ✅ Créer un patient en tant qu'utilisateur lié à un médecin
  async create(data: Partial<User>, medecinId: number): Promise<User> {
    const medecin = await this.userRepository.findOneBy({ id: medecinId });

    if (!medecin || medecin.role !== 'medecin') {
      throw new NotFoundException('Médecin introuvable');
    }

    const newPatient = this.userRepository.create({
      ...data,
      role: 'patient',
      medecin,
    });

    console.log('✅ Patient créé :', newPatient);

    return this.userRepository.save(newPatient);
  }

  // ✅ Modifier un patient
  async update(id: number, data: Partial<User>): Promise<User> {
    const patient = await this.findOne(id);
    Object.assign(patient, data);
    return this.userRepository.save(patient);
  }

  // ✅ Supprimer un patient
  async delete(id: number): Promise<void> {
    const result = await this.userRepository.delete({ id, role: 'patient' });

    if (result.affected === 0) {
      throw new NotFoundException('Patient introuvable');
    }
  }

  // ✅ Pour l’admin : lister tous les patients (sans filtre médecin)
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'patient' },
      relations: ['medecin'],
    });
  }
}
