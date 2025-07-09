import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets'
  import { Server, Socket } from 'socket.io'
  import { MessagesService } from './messages.service'
  import { CreateMessageDto } from './dto/create-message.dto'
  import { User } from '../users/user.entity'
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
  
    constructor(private readonly messageService: MessagesService) {}
  
    handleConnection(client: Socket) {
      console.log('🟢 Client connecté :', client.id)
    }
  
    handleDisconnect(client: Socket) {
      console.log('🔴 Client déconnecté :', client.id)
    }
  
    @SubscribeMessage('message')
    async handleMessage(@MessageBody() data: { senderId: number; content: string; receiverId: number; senderRole: 'patient' | 'medecin' }) {
      console.log('📨 Message reçu :', data)
  
      const fakeUser = { id: data.senderId } as User
  
      const message = await this.messageService.sendMessage(fakeUser, {
        content: data.content,
        receiverId: data.receiverId,
      }, data.senderRole)
  
      this.server.emit('message', message) // Renvoi aux autres
    }
  }
  