import { Injectable } from '@nestjs/common';
import { Board } from 'src/ChessRules/Board';
import { initializeBoard } from 'src/ChessRules/ChessBoard/initialize';
import { MainChess } from 'src/ChessRules/Main';
import { User } from 'src/ChessRules/user/User';

@Injectable()
export class ChessInitService {
  initBoard = () => {
    return initializeBoard();
  };
  checkMoves = (params: {
    users: User[];
    userMove: number[][];
    board: Board;
  }) => {
    return MainChess(
      params.users,
      params.board,
      params.userMove,
    );
  };
}
