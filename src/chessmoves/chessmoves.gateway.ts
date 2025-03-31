import { UseInterceptors } from '@nestjs/common';
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
import { socketMiddleware } from 'src/socket.middleware';

import { v4 as uuid } from 'uuid';

@UseInterceptors(socketMiddleware)
@WebSocketGateway({ cors: '*' })
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

  @SubscribeMessage('create')
  handleCreateEvent(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    const roomId = this.generateRoomId(); // Generate a unique room ID
    client.join(roomId);
    client.emit('roomCreated', roomId); // Send the room ID back to the client
    let user = this.chessService.setUser(data);
    let res = {
      user: user,
      msg: 'Share the Code and Kindly wait for the opponent to join',
    };
    this.rooms[roomId] = [user];
    this.server.to(roomId).emit('events', res);
  }

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
      client.emit('roomCreated', data.roomId);
      if (room.size < 2) {
        let userColor: 'W' | 'B';
        client.join(data.roomId);
        let gameCreatingUser: User =
          this.rooms[data.roomId][0];
        if (gameCreatingUser.color == 'W') userColor = 'B';
        else userColor = 'W';

        let joiningUser = this.chessService.setUser({
          name: data.name,
          color: userColor,
        });

        let setUser = {
          user: joiningUser,
          oppUser: gameCreatingUser,
        };
        client.emit('user', setUser);
        setUser.oppUser = joiningUser;
        setUser.user = gameCreatingUser;
        client.to(data.roomId).emit('user', setUser);

        // this.server
        //   .to(data.roomId)
        //   .emit('events', userResponse);
        this.rooms[data.roomId].push(joiningUser);
        data.color = userColor;
        let board = this.chessService.initBoard(data);
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
      } else {
        client.emit(
          'error',
          'The chat room is already full',
        );
      }
    } else {
      client.emit('error', 'Invalid Game ID'); // Send the room ID back to the client
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    data: { user: string; msg: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.emit('message', 'You : ' + data.msg);
    client
      .to(data.roomId)
      .emit('message', data.user + ' : ' + data.msg);
  }

  @SubscribeMessage('chessMove')
  async handleChessMoves(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Data is \n\n\n', data);

    let users: User[] = [];
    if (this.rooms[data.roomId][0].name == data.user.name) {
      users = this.rooms[data.roomId];
    } else {
      users.push(this.rooms[data.roomId][1]);
      users.push(this.rooms[data.roomId][0]);
    }
    let params = {
      users: users,
      userMove: data.userMove,
      board: data.board,
      promotion: data.promotionPiece,
    };

    try {
      if (
        users[0].color == 'B' &&
        users[0].userMove + 1 != users[1].userMove
      )
        throw 'Wait For Opps Move !!';
      else if (
        users[0].color == 'W' &&
        users[0].userMove != users[1].userMove
      )
        throw 'Wait For Opps Move !!';
      let board: Board =
        await this.chessService.checkmoves(params);

      users[0].userMove += 1;
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
      if (users[0].color == 'W') {
        client
          .to(data.roomId)
          .emit('oppUserMove', [
            7 - data.userMove[1][0],
            7 - data.userMove[1][1],
          ]);
      } else {
        client
          .to(data.roomId)
          .emit('oppUserMove', [
            data.userMove[1][0],
            data.userMove[1][1],
          ]);
      }

      if (users[1].isKingInCheck) {
        if (users[0].color == 'W') {
          client
            .to(data.roomId)
            .emit('kingCheck', [
              7 - users[1].kingPosition[0],
              7 - users[1].kingPosition[1],
            ]);
          client.emit('kingCheck', [
            users[1].kingPosition[0],
            users[1].kingPosition[1],
          ]);
        } else {
          client
            .to(data.roomId)
            .emit('kingCheck', [
              users[1].kingPosition[0],
              users[1].kingPosition[1],
            ]);
          client.emit('kingCheck', [
            7 - users[1].kingPosition[0],
            7 - users[1].kingPosition[1],
          ]);
        }
      }
      if (board.size == 0) {
        client.to(data.roomId).emit('gameStatus', 'lost');
        client.emit('gameStatus', 'won');
      }
    } catch (error) {
      console.log('Error is ', error);

      client.emit('board_error', error);
    }
  }
}
