import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Medecin } from '../medecins/medecin.entity'
import { User } from '../users/user.entity'
import { Ordonnance } from '../ordonnances/ordonnance.entity'; 
import { RendezVous } from '../rendezvous/rendezvous.entity'
import { Message } from '../messages/message.entity'// ✅ chemin correct


import * as bcrypt from 'bcrypt'

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Ordonnance)
    private readonly ordonnanceRepository: Repository<Ordonnance>,

    @InjectRepository(RendezVous)
    private readonly rendezVousRepo: Repository<RendezVous>,

    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  // 🔍 Trouver tous les patients d’un médecin
  async findByMedecinId(medecinId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: 'patient',
        medecin: { id: medecinId } as any,
      },
      relations: ['medecin'],
    })
  }

  // 🔍 Trouver un patient par son ID
  async findOne(id: number): Promise<User> {
    const patient = await this.userRepository.findOne({
      where: { id, role: 'patient' },
      relations: ['medecin'],
    })

    if (!patient) {
      throw new NotFoundException('Patient introuvable')
    }

    return patient
  }

  // ➕ Créer un nouveau patient (lié au médecin)
  async create(data: Partial<User>, medecinId: number): Promise<User> {
    const medecin = await this.medecinRepo.findOne({ where: { id: medecinId } })

    if (!medecin) {
      throw new NotFoundException('Médecin introuvable')
    }

    const age = data.dateNaissance ? calculateAge(data.dateNaissance as string) : null

    const newPatient = this.userRepository.create({
      ...data,
      age,
      role: 'patient',
      medecin,
      password: data.password
        ? await bcrypt.hash(data.password, 10)
        : await bcrypt.hash('123456', 10),
      maladiesConnues: data.maladiesConnues,
      traitementsEnCours: data.traitementsEnCours,
      allergies: data.allergies,
      antecedentsMedicaux: data.antecedentsMedicaux,
    })

    return this.userRepository.save(newPatient)
  }

  // ✏️ Modifier un patient
  async update(id: number, data: Partial<User>): Promise<User> {
    const patient = await this.findOne(id)

    // ⚠️ Ne jamais mettre à jour le mot de passe ici (sauf route dédiée)
    delete data.password

    Object.assign(patient, {
      ...data,
      maladiesConnues: data.maladiesConnues,
      traitementsEnCours: data.traitementsEnCours,
      allergies: data.allergies,
      antecedentsMedicaux: data.antecedentsMedicaux,
    })

    return this.userRepository.save(patient)
  }

  // ❌ Supprimer un patient + ses ordonnances
  async delete(id: number): Promise<void> {
    // 🧽 Supprimer d’abord les ordonnances liées
    await this.ordonnanceRepository.delete({ patient: { id } })

    // 🗑️ Supprimer ensuite le patient
    const result = await this.userRepository.delete({ id, role: 'patient' })

    if (result.affected === 0) {
      throw new NotFoundException('Patient introuvable')
    }
  }

  // 🔁 Récupérer tous les patients
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'patient' },
      relations: ['medecin'],
    })
  }
  async getRecentActivities(patientId: number) {
    const messages = await this.messageRepo.find({
      where: { receiver: { id: patientId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: 5,
    })

    const rendezvous = await this.rendezVousRepo.find({
      where: { patient: { id: patientId } },
      relations: ['medecin'],
      order: { date: 'DESC', heure: 'DESC' },
      take: 5,
    })

    const activities = [
      ...messages.map((m) => ({
        type: 'message',
        content: m.content,
        from: `${m.sender.prenom} ${m.sender.nom}`,
        createdAt: m.createdAt,
      })),
      ...rendezvous.map((r) => ({
        type: 'rendezvous',
        statut: r.statut,
        date: r.date,
        heure: r.heure,
        medecin: `${r.medecin.prenom} ${r.medecin.nom}`,
        createdAt: new Date(`${r.date}T${r.heure}`),
      })),
    ]

    return activities
      .sort(
        (a, b) =>
          (b.createdAt as any).getTime() - (a.createdAt as any).getTime(),
      )
      .slice(0, 10)
  }
}

// ✅ Fonction utilitaire : calcul de l’âge
function calculateAge(dateNaissance: string): number {
  const birthDate = new Date(dateNaissance)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
