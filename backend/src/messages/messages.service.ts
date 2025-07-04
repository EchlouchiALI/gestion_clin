// src/messages/messages.service.ts

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
}
