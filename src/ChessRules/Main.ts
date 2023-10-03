import { Board } from './Board';
import { initializeBoard } from './ChessBoard/initialize';
import { Piece } from './Piece';
import { updateCastle } from './moves/castle';
import { isKingInCheck } from './moves/kingCheck';
import { move } from './moves/move';
import { canProtectKing } from './moves/protectKing';
import { validPieceMove } from './moves/validatePieceMoves';
import { updatePiece } from './updateBoard';
import { User } from './user/User';

export const MainChess = (
  users: User[],
  board: Board,
  userMove: number[][],
) => {
  const user: User = users[0];
  const otherUser: User = users[1];
  let curr_move: move = {
    currentI: userMove[0][0],
    currentJ: userMove[0][1],
    toI: userMove[1][0],
    toJ: userMove[1][1],
  };
  let base_move: number[] = [
    curr_move.currentI,
    curr_move.currentJ,
    curr_move.toI,
    curr_move.toJ,
  ];

  if (validPieceMove(curr_move, board, user)) {
    // if (
    //   user.kingPosition[0] == curr_move.toI &&
    //   user.kingPosition[1] == curr_move.toJ
    // ) {
    //   continue;
    // }

    let piece: Piece | undefined =
      board.grid[curr_move.toI][curr_move.toJ].piece;
    updatePiece(curr_move, user, board.grid);
    if (isKingInCheck(board, user)) {
      updatePiece(curr_move, user, board.grid, true, piece);
      throw 'Retryyyy king is in check !!!';
    }
    (curr_move.currentI = base_move[0]),
      (curr_move.currentJ = base_move[1]),
      (curr_move.toI = base_move[2]),
      (curr_move.toJ = base_move[3]);

    updateCastle(user, curr_move);
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

  return board;
};

// console.log(user1, user2);
