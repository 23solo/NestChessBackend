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
// @WebSocketGateway({ cors: '*' })
@WebSocketGateway({ transports: ['polling', 'websocket'] })
export class ChessmovesGateway {
  constructor(private chessService: ChessInitService) {}
  generateRoomId = () => {
    return uuid();
  };

  onModuleInit() {
    setInterval(() => {
      Object.keys(this.rooms).forEach((roomId) => {
        let users = this.rooms[roomId];

        const currentPlayer = users.find(
          (u) => u.startTime,
        );
        const opponent = users.find((u) => !u.startTime);

        if (!currentPlayer || !opponent) return;

        // Calculate elapsed time and update remaining time
        if (currentPlayer.startTime) {
          const elapsedTime =
            Date.now() - currentPlayer.startTime;
          currentPlayer.timeLeft -= elapsedTime;
          currentPlayer.startTime = Date.now(); // Reset timer update
        }

        // If time runs out, declare a winner
        if (currentPlayer.timeLeft <= 0) {
          // Send "lost" only to the current player
          this.server
            .to(currentPlayer.socketId)
            .emit('gameStatus', {
              status: 'lost',
              loser: currentPlayer.name,
              winner: opponent.name,
            });

          // Send "won" only to the opponent
          this.server
            .to(opponent.socketId)
            .emit('gameStatus', {
              status: 'won',
              winner: opponent.name,
              loser: currentPlayer.name,
            });

          console.log(
            `Game Over: ${currentPlayer.name} ran out of time. ${opponent.name} wins!`,
          );

          // Stop tracking this game to prevent further updates
          delete this.rooms[roomId];
        }
      });
    }, 1000);
  }

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
    const start = Date.now();
    const roomId = this.generateRoomId(); // Generate a unique room ID
    client.join(roomId);
    client.emit('roomCreated', roomId); // Send the room ID back to the client
    let user = this.chessService.setUser(data);
    user.socketId = client.id;
    let res = {
      user: user,
      msg: 'Share the Code and Kindly wait for the opponent to join',
    };
    this.rooms[roomId] = [user];
    this.server.to(roomId).emit('events', res);

    const end = Date.now();
    console.log(
      `Request to create room took ${end - start} ms`,
    );
  }

  @SubscribeMessage('join')
  handleJoinEvent(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    const start = Date.now();
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
        joiningUser.socketId = client.id;

        let setUser = {
          user: joiningUser,
          oppUser: gameCreatingUser,
        };
        client.emit('user', setUser);
        setUser.oppUser = joiningUser;
        setUser.user = gameCreatingUser;
        client.to(data.roomId).emit('user', setUser);

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

    const end = Date.now();
    console.log(
      `Request to join room took ${end - start} ms`,
    );
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
    const start = Date.now();
    console.log('Data is \n\n\n', data);

    let users: User[] = [];
    if (this.rooms[data.roomId][0].name == data.user.name) {
      users = this.rooms[data.roomId];
    } else {
      users.push(this.rooms[data.roomId][1]);
      users.push(this.rooms[data.roomId][0]);
    }

    const currentPlayer = users.find(
      (u) => u.name === data.user.name,
    );
    const opponent = users.find(
      (u) => u.name !== data.user.name,
    );

    console.log(
      'Curreent and opponent is',
      currentPlayer,
      opponent,
    );

    if (!currentPlayer || !opponent) return;
    // **Calculate elapsed time and update remaining time**
    if (currentPlayer.startTime) {
      const elapsedTime =
        Date.now() - currentPlayer.startTime;
      currentPlayer.timeLeft -= elapsedTime;
    }

    // **Check if player ran out of time**
    if (currentPlayer.timeLeft <= 0) {
      this.server.to(data.roomId).emit('timeOut', {
        loser: currentPlayer.name,
        winner: opponent.name,
      });
      return;
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
        throw "Wait For Opponent's Move!";
      else if (
        users[0].color == 'W' &&
        users[0].userMove != users[1].userMove
      )
        throw "Wait For Opponent's Move!";

      let board: Board =
        await this.chessService.checkmoves(params);

      users[0].userMove += 1;
      // **Update turn: stop current player's clock, start opponent's clock**
      currentPlayer.startTime = undefined;
      opponent.startTime = Date.now(); // Start opponent's timer

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

      console.log('Came til here');

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
            users[1].kingPosition[0],
            users[1].kingPosition[1],
          ]);
        }
      }

      if (board.size == 0) {
        client.emit('gameStatus', {
          status: 'won',
          winner: data.user.name,
          loser: opponent.name,
        });

        client.to(data.roomId).emit('gameStatus', {
          status: 'lost',
          loser: data.user.name,
          winner: opponent.name,
        });

        // Optionally remove the game room to stop further updates
        delete this.rooms[data.roomId];
      }

      // **Emit updated time to frontend**
      console.log({
        whiteTime:
          users[0].color === 'W'
            ? users[0].timeLeft
            : users[1].timeLeft,
        blackTime:
          users[0].color === 'B'
            ? users[0].timeLeft
            : users[1].timeLeft,
      });

      this.server.to(data.roomId).emit('updateTime', {
        whiteTime:
          users[0].color === 'W'
            ? users[0].timeLeft
            : users[1].timeLeft,
        blackTime:
          users[0].color === 'B'
            ? users[0].timeLeft
            : users[1].timeLeft,
      });
    } catch (error) {
      console.log('Error is ', error);
      client.emit('board_error', error);
    }

    const end = Date.now();
    console.log(
      `Request to handle chess move took ${end - start} ms`,
    );
  }
}
