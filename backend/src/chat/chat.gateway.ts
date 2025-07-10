import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  // ✅ Connexion socket
  handleConnection(client: Socket) {
    console.log(`🟢 Client connecté : ${client.id}`)
  }

  // ✅ Déconnexion socket
  handleDisconnect(client: Socket) {
    console.log(`🔴 Client déconnecté : ${client.id}`)
  }

  // ✅ Réception d’un message et diffusion à tous
  @SubscribeMessage('send_message')
  handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📨 Nouveau message reçu :', message)

    // On broadcast à tous les sockets connectés
    this.server.emit('receive_message', message)
  }
}
