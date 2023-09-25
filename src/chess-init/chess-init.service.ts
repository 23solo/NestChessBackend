import { Injectable } from '@nestjs/common';
import { Board } from 'src/ChessRules/Board';
import { initializeBoard } from 'src/ChessRules/ChessBoard/initialize';
import { MainChess } from 'src/ChessRules/Main';
import { User } from 'src/ChessRules/user/User';

@Injectable()
export class ChessInitService {
  initBoard = (params: any) => {
    // console.log(params);
    if (params.color == 'B') {
      return this.reverseBoard(initializeBoard());
    }
    return initializeBoard();
  };

  checkMoves = (params: {
    users: User[];
    userMove: number[][];
    board: Board;
  }) => {
    if (params.users[0].color == 'B') {
      params.board = this.reverseBoard(params.board);
      params.userMove = this.getReverseMove(
        params.userMove,
      );
    }

    return MainChess(
      params.users,
      params.board,
      params.userMove,
    );
  };

  setUser = (params: {
    name: string;
    color: 'W' | 'B';
  }) => {
    let user: User = {
      name: params.name,
      color: params.color,
      canCastleLeft: true,
      canCastleRight: true,
      isKingInCheck: false,
      kingCheckedFrom: [-1, -1],
      kingPosition: [6, 4],
    };
    if (params.color == 'B') {
      user.kingPosition = [0, 4];
    } else {
      user.kingPosition = [7, 4];
    }

    return user;
  };

  reverseBoard = (board: Board) => {
    const size = 7;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        let temp = board.grid[i][j];
        board.grid[i][j] = board.grid[size - i][size - j];
        board.grid[size - i][size - j] = temp;
      }
    }
    return board;
  };

  getReverseMove = (move: number[][]) => {
    move[0][0] = 7 - move[0][0];
    move[0][1] = 7 - move[0][1];
    move[1][0] = 7 - move[1][0];
    move[1][1] = 7 - move[1][1];
    return move;
  };
}
