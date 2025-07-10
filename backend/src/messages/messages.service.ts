import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from './message.entity'
import { CreateMessageDto } from './dto/create-message.dto'
import { User } from '../users/user.entity'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  // ✅ Envoyer un message (chat)
  async sendMessage(sender: User, dto: CreateMessageDto, senderRole: 'patient' | 'medecin') {
    const msg = this.messageRepo.create({
      content: dto.content,
      senderRole,
      sender,
      receiver: { id: dto.receiverId },
    })
    return this.messageRepo.save(msg)
  }

  // ✅ Obtenir la conversation patient-médecin
  async getConversation(patientId: number, medecinId: number) {
    return this.messageRepo.find({
      where: [
        { sender: { id: patientId }, receiver: { id: medecinId } },
        { sender: { id: medecinId }, receiver: { id: patientId } },
      ],
      order: { createdAt: 'ASC' },
    })
  }

  // ✅ Patient : envoyer une demande de conversation
  async createDemande(patientId: number, medecinId: number) {
    const message = this.messageRepo.create({
      sender: { id: patientId },
      receiver: { id: medecinId },
      content: 'Demande de conversation',
      senderRole: 'patient',
      isRequest: true,
    })

    return this.messageRepo.save(message)
  }

  // ✅ Médecin : voir les demandes reçues
  async getDemandesReçues(medecinId: number) {
    return this.messageRepo.find({
      where: {
        receiver: { id: medecinId },
        isRequest: true,
      },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    })
  }

  // ✅ Médecin : accepter une demande
  async acceptDemande(medecinId: number, patientId: number) {
    const message = this.messageRepo.create({
      sender: { id: medecinId },
      receiver: { id: patientId },
      content: "Demande acceptée. Vous pouvez commencer à discuter.",
      senderRole: 'medecin',
      isRequest: false,
    })
    return this.messageRepo.save(message)
  }

  // ✅ Médecin : voir toutes les conversations actives avec ses patients
  async getConversationsForMedecin(medecinId: number) {
    const messages = await this.messageRepo.find({
      where: [
        { sender: { id: medecinId } },
        { receiver: { id: medecinId } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    })

    const conversationsMap = new Map<number, User>()

    for (const message of messages) {
      const user = message.sender.id === medecinId ? message.receiver : message.sender
      if (user.role === 'patient' && !conversationsMap.has(user.id)) {
        conversationsMap.set(user.id, user)
      }
    }

    return Array.from(conversationsMap.values())
  }

  // ✅ Patient : voir toutes les conversations acceptées avec ses médecins
  async getConversationsForPatient(patientId: number) {
    const messages = await this.messageRepo.find({
      where: [
        { sender: { id: patientId }, isRequest: false },
        { receiver: { id: patientId }, isRequest: false },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    })

    const medecinsMap = new Map<number, User>()

    for (const message of messages) {
      const user = message.sender.id === patientId ? message.receiver : message.sender
      if (user.role === 'medecin' && !medecinsMap.has(user.id)) {
        medecinsMap.set(user.id, user)
      }
    }

    return Array.from(medecinsMap.values())
  }

  // ✅ Patient : voir les demandes envoyées + statut
  async getDemandesEnvoyeesParPatient(patientId: number) {
    const demandes = await this.messageRepo.find({
      where: {
        sender: { id: patientId },
        isRequest: true,
      },
      relations: ['receiver'],
      order: { createdAt: 'DESC' },
    })
  
    const results: {
      medecinId: number
      medecinNom: string
      medecinPrenom: string
      statut: string
    }[] = []
  
    for (const demande of demandes) {
      const statut = await this.inferStatutDemande(patientId, demande.receiver.id)
  
      results.push({
        medecinId: demande.receiver.id,
        medecinNom: demande.receiver.nom,
        medecinPrenom: demande.receiver.prenom,
        statut,
      })
    }
  
    return results
  }
  

  // ✅ Déterminer si un médecin a accepté une demande
  private async inferStatutDemande(patientId: number, medecinId: number): Promise<string> {
    const reponse = await this.messageRepo.findOne({
      where: {
        sender: { id: medecinId },
        receiver: { id: patientId },
        isRequest: false,
      },
    })

    return reponse ? 'accepte' : 'en_attente'
  }

  // ✅ Supprimer un message
  async deleteMessage(id: number) {
    return this.messageRepo.delete(id)
  }
  async refuserDemande(medecinId: number, patientId: number) {
    const message = this.messageRepo.create({
      sender: { id: medecinId },
      receiver: { id: patientId },
      content: "Demande refusée.",
      senderRole: 'medecin',
      isRequest: false,
    })
    return this.messageRepo.save(message)
  }
  
}
