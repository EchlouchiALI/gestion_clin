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

  async findByMedecinId(medecinId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: 'patient',
        medecin: { id: medecinId } as any,
      },
      relations: ['medecin'],
    });
  }

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

  async create(data: Partial<User>, medecinId: number): Promise<User> {
    const medecin = await this.medecinRepo.findOne({ where: { id: medecinId } });

    if (!medecin) {
      throw new NotFoundException('Médecin introuvable');
    }

    const age = calculateAge(data.dateNaissance as string);

    const newPatient = this.userRepository.create({
      ...data,
      age,
      role: 'patient',
      medecin,
    });

    return this.userRepository.save(newPatient);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const patient = await this.findOne(id);
    Object.assign(patient, data);
    return this.userRepository.save(patient);
  }

  async delete(id: number): Promise<void> {
    const result = await this.userRepository.delete({ id, role: 'patient' });

    if (result.affected === 0) {
      throw new NotFoundException('Patient introuvable');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'patient' },
      relations: ['medecin'],
    });
  }
}

// ✅ Définie en dehors de la classe
function calculateAge(dateNaissance: string): number {
  const birthDate = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
