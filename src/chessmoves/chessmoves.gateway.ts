import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';

@WebSocketGateway(8001, { cors: '*' })
export class ChessmovesGateway {
  generateRoomId = () => {
    return uuid();
  };

  @WebSocketServer()
  server: Server;
  private rooms: string[] = [];

  @SubscribeMessage('join')
  handleJoinEvent(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    if (this.server.sockets.adapter.rooms.has(roomId)) {
      const room =
        this.server.sockets.adapter.rooms.get(roomId);
      if (room.size < 4) {
        client.join(roomId);
        this.server
          .to(roomId)
          .emit('events', 'A new user joined the chat');
      } else {
        client.emit(
          'error',
          'The chat room is already full',
        );
      }
    } else {
      const roomId = this.generateRoomId(); // Generate a unique room ID
      this.rooms.push(roomId); // Store the room ID
      client.join(roomId);
      client.emit('roomCreated', roomId); // Send the room ID back to the client
      this.server
        .to(roomId)
        .emit(
          'events',
          'You are the first user in the chat',
        );
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { msg: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.to(data.roomId).emit('events', 'Hola');
    // client.to()
    client.to(data.roomId).emit('message', data.msg);
    console.log('roomId is', data.roomId);

    client.emit('message', data.msg);
  }
}
