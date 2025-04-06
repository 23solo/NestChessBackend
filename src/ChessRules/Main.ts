import { StockfishService } from 'src/services/stockfish.service';
import { Board } from './Board';
import { initializeBoard } from './ChessBoard/initialize';
import { Piece } from './Piece';
import { updateCastle } from './moves/castle';
import { isKingInCheck } from './moves/kingCheck';
import { Move } from './moves/move';
import { canProtectKing } from './moves/protectKing';
import { validPieceMove } from './moves/validatePieceMoves';
import { updatePiece } from './updateBoard';
import { User } from './user/User';

export const MainChess = async (
  users: User[],
  board: Board,
  userMove: number[][],
  stockfishService: StockfishService,
  promotion: any = false,
) => {
  const user: User = users[0];
  const otherUser: User = users[1];
  let currMove: Move = {
    currentI: userMove[0][0],
    currentJ: userMove[0][1],
    toI: userMove[1][0],
    toJ: userMove[1][1],
  };
  let baseMove: number[] = [
    currMove.currentI,
    currMove.currentJ,
    currMove.toI,
    currMove.toJ,
  ];

  if (validPieceMove(currMove, board, user)) {
    board.lastMove = currMove;
    let piece: Piece | undefined =
      board.grid[currMove.toI][currMove.toJ].piece;
    console.log('Promotions i ', promotion);

    updatePiece(
      currMove,
      user,
      board.grid,
      false,
      undefined,
      promotion,
    );
    if (isKingInCheck(board, user)) {
      updatePiece(currMove, user, board.grid, true, piece);
      throw 'Retryyyy king is in check !!!';
    }
    (currMove.currentI = baseMove[0]),
      (currMove.currentJ = baseMove[1]),
      (currMove.toI = baseMove[2]),
      (currMove.toJ = baseMove[3]);

    updateCastle(user, currMove);
    if (isKingInCheck(board, otherUser)) {
      otherUser.isKingInCheck = true;

      // Check if user has any valid moves to protect his king else declare curr_user as winner
      if (!canProtectKing(board, otherUser)) {
        console.log(
          `\n\n Winner ${user.name} has beat ${otherUser.name}\n\n`,
        );
        board.size = 0; // Just to know game has ended
        return board;
      }
    }
    // if the king was in check before now after valid move it's safe
    if (user.isKingInCheck) {
      user.isKingInCheck = false;
    }
  } else {
    throw 'Retry invalid move!!!';
  }

  console.log('\n\n');
  let fenString = '';
  for (let i = 0; i < 8; i++) {
    if (i != 0) fenString += '/';
    let count = 0;
    for (let j = 0; j < 8; j++) {
      const pieceVal = board.grid[i][j].piece;
      if (pieceVal) {
        if (count != 0) {
          fenString += count;
          count = 0;
        }
        fenString += board.grid[i][j].piece.key;
      } else {
        count += 1;
      }
    }
    if (count != 0) {
      fenString += count;
    }
  }
  fenString +=
    ' ' +
    otherUser.color.toLocaleLowerCase() +
    ' KQkq - 0 1';
  console.log('Final string is ', fenString);
  // const res = await stockfishService.getBestMove(fenString);
  // console.log(`Best move is ${res}`);

  return board;
};

// console.log(user1, user2);
