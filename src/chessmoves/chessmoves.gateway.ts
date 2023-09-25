import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Board } from 'src/ChessRules/Board';
import { User } from 'src/ChessRules/user/User';
import { ChessInitService } from 'src/chess-init/chess-init.service';

import { v4 as uuid } from 'uuid';

@WebSocketGateway(8001, { cors: '*' })
export class ChessmovesGateway {
  constructor(private chessService: ChessInitService) {}
  generateRoomId = () => {
    return uuid();
  };

  @WebSocketServer()
  server: Server;
  private rooms: Map<string, User[] | []> = new Map<
    string,
    User[]
  >();

  @SubscribeMessage('join')
  handleJoinEvent(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    if (
      this.server.sockets.adapter.rooms.has(data.roomId)
    ) {
      const room = this.server.sockets.adapter.rooms.get(
        data.roomId,
      );
      if (room.size < 2) {
        let userColor: 'W' | 'B';
        client.join(data.roomId);
        let gameCreatingUser: User =
          this.rooms[data.roomId][0];
        if (gameCreatingUser.color == 'W') userColor = 'B';
        else userColor = 'W';

        let joiningUser = this.chessService.setUser({
          name: 'Polo',
          color: userColor,
        });

        let userResponse = {
          user: joiningUser,
          msg: 'A new user joined the chat',
        };
        let setUser = {
          user: joiningUser,
          oppUser: gameCreatingUser,
        };
        client.emit('user', setUser);
        setUser.oppUser = joiningUser;
        setUser.user = gameCreatingUser;
        client.to(data.roomId).emit('user', setUser);

        this.server
          .to(data.roomId)
          .emit('events', userResponse);
        this.rooms[data.roomId].push(joiningUser);
        data.color = userColor;
        let board = this.chessService.initBoard(data);
        data.name = 'solo';
        let user = this.chessService.setUser(data);
        let res = {
          board: board,
          oppUser: user,
        };
        data.color = gameCreatingUser.color;
        data.name = gameCreatingUser.name;
        client.emit('chessinit', res);

        board = this.chessService.initBoard(data);
        res.oppUser = gameCreatingUser;
        res.board = board;
        client.to(data.roomId).emit('chessinit', res);

        console.log('second', res.board.grid[0][0].piece);
      } else {
        client.emit(
          'error',
          'The chat room is already full',
        );
      }
    } else {
      const roomId = this.generateRoomId(); // Generate a unique room ID
      client.join(roomId);
      client.emit('roomCreated', roomId); // Send the room ID back to the client
      data.name = 'Solo';
      let user = this.chessService.setUser(data);
      let res = {
        user: user,
        msg: 'Share the Code and Kindly wait for the opponent to join',
      };
      this.rooms[roomId] = [user];
      this.server.to(roomId).emit('events', res);
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { msg: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.to(data.roomId).emit('message', data.msg);
    client.emit('message', 'Hello Sender');
  }

  @SubscribeMessage('chessMove')
  handleChessMoves(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(data.user);
    let users: User[] = [];
    if (this.rooms[data.roomId][0].name == data.user.name)
      users = this.rooms[data.roomId];
    else {
      users.push(this.rooms[data.roomId][1]);
      users.push(this.rooms[data.roomId][0]);
    }
    let params = {
      users: users,
      userMove: data.userMove,
      board: data.board,
    };
    try {
      let board: Board =
        this.chessService.checkMoves(params);
      if (data.user.color == 'B') {
        client.to(data.roomId).emit('chessMove', board);
        client.emit(
          'chessMove',
          this.chessService.reverseBoard(board),
        );
      } else {
        client.emit('chessMove', board);
        client
          .to(data.roomId)
          .emit(
            'chessMove',
            this.chessService.reverseBoard(board),
          );
      }
      if (board.size == 0) {
        client.to(data.roomId).emit('gameStatus', 'lost');
        client.emit('gameStatus', 'won');
      }
    } catch (error) {
      client.emit('error', error);
    }
  }
}
