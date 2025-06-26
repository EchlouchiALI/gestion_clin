import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ✅ Récupérer tous les utilisateurs d’un certain rôle
  async findAllByRole(role: 'admin' | 'medecin' | 'patient') {
    return this.userRepo.find({ where: { role } });
  }

  // ✅ Supprimer un utilisateur (admin ou patient)
  async deleteUser(id: string) {
    await this.userRepo.delete(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }

  // ✅ Créer un patient avec mot de passe hashé
  async createPatient(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = this.userRepo.create({
      ...data,
      age: Number(data.age),
      password: hashedPassword,
      role: 'patient',
      isActive: true,
    });
    return this.userRepo.save(newUser);
  }

  // ✅ Mettre à jour un patient
  async updatePatient(id: number, data: Partial<User>) {
    const patient = await this.userRepo.findOneBy({ id });
    if (!patient) throw new NotFoundException('Patient introuvable');

    Object.assign(patient, data);
    return this.userRepo.save(patient);
  }

  // ✅ Récupérer un utilisateur (profil patient par exemple)
  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: [
        'id',
        'nom',
        'prenom',
        'email',
        'age',
        'lieuNaissance',
        'role',
        'isActive',
      ],
    });
  }
}
