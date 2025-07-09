import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { RendezVous } from 'src/rendezvous/rendezvous.entity'
import { Activity } from '../activity/activity.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(RendezVous)
    private readonly rendezvousRepo: Repository<RendezVous>,

    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
  ) {}

  // ✅ Récupérer tous les utilisateurs par rôle
  async findAllByRole(role: 'admin' | 'medecin' | 'patient') {
    return this.userRepo.find({
      where: { role },
      select: ['id', 'nom', 'prenom', 'email', 'age', 'lieuNaissance', 'specialite', 'telephone'],
      order: { nom: 'ASC' },
    })
  }

  // ✅ Supprimer un utilisateur si pas lié à un rendez-vous
  async deleteUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(id) } })
    if (!user) throw new NotFoundException("Utilisateur introuvable")

    const hasRdv = await this.rendezvousRepo.findOne({
      where: [
        { patient: { id: user.id } },
        { medecin: { id: user.id } },
      ],
    })

    if (hasRdv) {
      throw new BadRequestException("Impossible de supprimer cet utilisateur : il est lié à un ou plusieurs rendez-vous.")
    }

    await this.userRepo.delete(id)
    return { message: 'Utilisateur supprimé avec succès' }
  }

  // ✅ Créer un patient
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

  // ✅ Mettre à jour un patient
  async updatePatient(id: number, data: Partial<User>) {
    const patient = await this.userRepo.findOneBy({ id })
    if (!patient) throw new NotFoundException('Patient introuvable')

    Object.assign(patient, data)
    return this.userRepo.save(patient)
  }

  // ✅ Récupérer un utilisateur par ID
  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['medecin'],
      select: ['id', 'nom', 'prenom', 'email', 'age', 'lieuNaissance', 'role', 'isActive'],
    })
  }

  // ✅ ✅ Méthode propre pour liste des médecins
  async findAllMedecins() {
    return this.userRepo.find({
      where: { role: 'medecin' },
      order: { nom: 'ASC' },
      select: ['id', 'nom', 'prenom', 'specialite'],
    })
  }

  // ✅ Mise à jour générique
  async update(id: number, data: Partial<User>) {
    const user = await this.userRepo.findOneBy({ id })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    Object.assign(user, data)
    return this.userRepo.save(user)
  }

  // ✅ Mise à jour du mot de passe
  async updatePassword(id: number, newPassword: string) {
    const user = await this.userRepo.findOneBy({ id })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed

    await this.userRepo.save(user)
    return { message: 'Mot de passe mis à jour' }
  }

  // ✅ Suppression simple
  async remove(id: number) {
    const user = await this.userRepo.findOneBy({ id })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    await this.userRepo.delete(id)
    return { message: 'Compte supprimé' }
  }
}
