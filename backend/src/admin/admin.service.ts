import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from 'src/users/user.entity';
import { RendezVous } from 'src/rendezvous/rendezvous.entity';
import { Medecin } from 'src/medecins/medecin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RendezVous) private rdvRepo: Repository<RendezVous>,
    @InjectRepository(Medecin) private medecinRepo: Repository<Medecin>,
  ) {}

  // 📊 Statistiques globales
  async getStats() {
    const totalUsers = await this.userRepo.count();
    const totalRdv = await this.rdvRepo.count();
    const totalPatients = await this.userRepo.count({ where: { role: 'patient' } });
    const totalAdmins = await this.userRepo.count({ where: { role: 'admin' } });
    const totalMedecins = await this.medecinRepo.count();
    const totalAllUsers = totalPatients + totalMedecins + totalAdmins;

    return {
      totalUsers,
      totalPatients,
      totalMedecins,
      totalAdmins,
      totalAllUsers,
      totalRdv,
    };
  }

  // 👥 Liste des utilisateurs
  async getAllUsers() {
    const users = await this.userRepo.find();
    return users.map(({ password, ...rest }) => rest); // Exclure le mot de passe
  }

  // ❌ Supprimer un utilisateur
  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.userRepo.remove(user);
  }

  // 🔍 Recherche utilisateur
  async searchUsers(query: string) {
    return this.userRepo.find({
      where: [
        { nom: ILike(`%${query}%`) },
        { prenom: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }

  // 🛠 Mise à jour du rôle
  async updateUserRole(id: number, role: 'admin' | 'medecin' | 'patient') {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    user.role = role;
    return this.userRepo.save(user);
  }

  // 📈 Statistiques détaillées (pour dashboard admin)
  async getFullStats() {
    const totalPatients = await this.userRepo.count({ where: { role: 'patient' } });
    const totalMedecins = await this.userRepo.count({ where: { role: 'medecin' } });
    const totalUsers = await this.userRepo.count();
    const totalRdv = await this.rdvRepo.count();

    // ✅ Statistiques rendez-vous par jour de la semaine
    const rdvs = await this.rdvRepo.find();
    const joursSemaines = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const rdvCountByDay = joursSemaines.map(jour => ({ name: jour, rdv: 0 }));

    for (const rdv of rdvs) {
      const fullDate = new Date(`${rdv.date}T${rdv.heure}`);
      const jour = fullDate.toLocaleDateString('fr-FR', { weekday: 'short' });
      const index = rdvCountByDay.findIndex(j => j.name === jour);
      if (index !== -1) {
        rdvCountByDay[index].rdv += 1;
      }
    }

    // ✅ Évolution mensuelle patients/médecins
    const evolution = await this.userRepo.query(`
      SELECT
        TO_CHAR(created_at, 'Mon') AS mois,
        role,
        COUNT(*) AS count
      FROM "user"
      WHERE role IN ('patient', 'medecin')
      GROUP BY TO_CHAR(created_at, 'Mon'), role
      ORDER BY MIN(created_at)
    `);

    const evoMap: Record<string, { patients: number, medecins: number }> = {};
    for (const row of evolution) {
      const mois = row.mois;
      if (!evoMap[mois]) evoMap[mois] = { patients: 0, medecins: 0 };
      if (row.role === 'patient') evoMap[mois].patients = +row.count;
      if (row.role === 'medecin') evoMap[mois].medecins = +row.count;
    }

    const evolutionData = Object.entries(evoMap).map(([mois, data]) => ({
      mois,
      ...data,
    }));

    // ✅ Répartition des spécialités
    const specialitesRaw = await this.userRepo.query(`
      SELECT specialite, COUNT(*) as count
      FROM "user"
      WHERE role = 'medecin' AND specialite IS NOT NULL
      GROUP BY specialite
    `);

    const specialites = specialitesRaw.map((row) => ({
      name: row.specialite,
      value: +row.count,
    }));

    return {
      totalUsers,
      totalPatients,
      totalMedecins,
      totalRdv,
      rdvDetails: rdvCountByDay,
      evolution: evolutionData,
      specialites,
    };
  }
}
