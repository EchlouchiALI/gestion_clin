import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket) {
      console.log(`🟢 Client connecté : ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`🔴 Client déconnecté : ${client.id}`);
    }
  
    @SubscribeMessage('message')
    handleMessage(
      @MessageBody() message: { sender: string; content: string },
      @ConnectedSocket() client: Socket,
    ) {
      console.log(`📨 Message reçu :`, message);
      this.server.emit('message', message); // On envoie à tous les clients
    }
  }
  