import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatMessage } from './entities/chat-message.entity'
import { User } from '../src/users/user.entity' // ✅ Chemin corrigé

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  async saveMessage(from: 'user' | 'bot', text: string, user: User) {
    const msg = this.chatRepo.create({ from, text, user })
    return this.chatRepo.save(msg)
  }

  async getHistory(userId: number) {
    return this.chatRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    })
  }
}
