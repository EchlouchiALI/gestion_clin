// src/messages/messages.module.ts

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './message.entity'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { User } from '../users/user.entity'
import { MessageGateway } from './message.gateway'
import { UsersModule } from '../users/users.module' // ✅ à ajouter

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    UsersModule, // ✅ à ajouter ici
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
})
export class MessagesModule {}
