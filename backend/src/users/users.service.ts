import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>, // ✅ C'est bien "userRepo"
  ) {}

  // ✅ Tous les utilisateurs d’un certain rôle (admin, medecin, patient)
  async findAllByRole(role: 'admin' | 'medecin' | 'patient') {
    return this.userRepo.find({ where: { role } })
  }

  // ✅ Supprimer un utilisateur
  async deleteUser(id: string) {
    await this.userRepo.delete(id)
    return { message: 'Patient supprimé avec succès' }
  }

  // ✅ Créer un patient avec mot de passe hashé
  async createPatient(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser = this.userRepo.create({
      ...data,
      age: Number(data.age),
      password: hashedPassword,
      role: 'patient',
      isActive: true,
    })
    return this.userRepo.save(newUser)
  }

  // ✅ Récupérer les infos d’un utilisateur par ID (profil patient)
  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'nom', 'prenom', 'email', 'age', 'lieuNaissance', 'role', 'isActive'],
    })
  }
}
