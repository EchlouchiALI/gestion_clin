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

  async sendMessage(sender: User, dto: CreateMessageDto, senderRole: 'patient' | 'medecin') {
    const msg = this.messageRepo.create({
      content: dto.content,
      senderRole,
      sender,
      receiver: { id: dto.receiverId },
    })
    return this.messageRepo.save(msg)
  }

  async getConversation(patientId: number, medecinId: number) {
    return this.messageRepo.find({
      where: [
        { sender: { id: patientId }, receiver: { id: medecinId } },
        { sender: { id: medecinId }, receiver: { id: patientId } },
      ],
      order: { createdAt: 'ASC' },
    })
  }

  async createDemande(patientId: number, medecinId: number) {
    const message = this.messageRepo.create({
      sender: { id: patientId },
      receiver: { id: medecinId },
      content: 'Demande de conversation',
      senderRole: 'patient',
      isRequest: true,
    });

    return this.messageRepo.save(message);
  }
  async getDemandesReçues(medecinId: number) {
    return this.messageRepo.find({
      where: {
        receiver: { id: medecinId },
        isRequest: true,
      },
      relations: ['sender'], // Pour récupérer les infos du patient
      order: { createdAt: 'DESC' },
    })
  }
  async getConversationsForMedecin(medecinId: number) {
    const messages = await this.messageRepo.find({
      where: [
        { sender: { id: medecinId } },
        { receiver: { id: medecinId } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  
    const conversationsMap = new Map<number, User>();
  
    for (const message of messages) {
      const user =
        message.sender.id === medecinId ? message.receiver : message.sender;
      if (user.role === 'patient' && !conversationsMap.has(user.id)) {
        conversationsMap.set(user.id, user);
      }
    }
  
    return Array.from(conversationsMap.values());
  }
  async acceptDemande(medecinId: number, patientId: number) {
    // Convertir la demande en message normal
    const message = this.messageRepo.create({
      sender: { id: medecinId },
      receiver: { id: patientId },
      content: "Demande acceptée. Vous pouvez commencer à discuter.",
      senderRole: 'medecin',
      isRequest: false,
    })
    return this.messageRepo.save(message)
  }
  async deleteMessage(id: number) {
    return this.messageRepo.delete(id)
  }
  
  async getConversationsForPatient(patientId: number) {
    const messages = await this.messageRepo.find({
      where: [
        { sender: { id: patientId }, isRequest: false },
        { receiver: { id: patientId }, isRequest: false },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  
    const medecinsMap = new Map<number, User>();
  
    for (const message of messages) {
      const user =
        message.sender.id === patientId ? message.receiver : message.sender;
      if (user.role === 'medecin' && !medecinsMap.has(user.id)) {
        medecinsMap.set(user.id, user);
      }
    }
  
    return Array.from(medecinsMap.values());
  }
  
}
