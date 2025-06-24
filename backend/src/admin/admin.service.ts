import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from 'src/users/user.entity';
import { RendezVous } from 'src/rendezvous/rendezvous.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RendezVous) private rdvRepo: Repository<RendezVous>,
  ) {}

  // 📊 Statistiques
  async getStats() {
    const totalUsers = await this.userRepo.count();
    const totalRdv = await this.rdvRepo.count();
    const totalPatients = await this.userRepo.count({ where: { role: 'patient' } });
    const totalMedecins = await this.userRepo.count({ where: { role: 'medecin' } });

    return {
      totalUsers,
      totalPatients,
      totalMedecins,
      totalRdv,
    };
  }

  // 👥 Tous les utilisateurs (sans mot de passe)
  async getAllUsers() {
    const users = await this.userRepo.find();
    return users.map(({ password, ...rest }) => rest);
  }

  // ❌ Supprimer un utilisateur
  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return this.userRepo.remove(user);
  }

  // 🔍 Recherche utilisateur par nom, prénom ou email
  async searchUsers(query: string) {
    return this.userRepo.find({
      where: [
        { nom: ILike(`%${query}%`) },
        { prenom: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }

  // 🛠 Modifier le rôle
  async updateUserRole(id: number, role: 'admin' | 'medecin' | 'patient') {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    user.role = role;
    return this.userRepo.save(user);
  }
}
