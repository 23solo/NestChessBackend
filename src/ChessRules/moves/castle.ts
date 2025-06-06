import { Board } from '../Board';
import { Piece } from '../Piece';
import { updatePiece } from '../updateBoard';
import { User } from '../user/User';
import { getMove } from './getMoves';
import { isKingInCheck } from './kingCheck';
import { Move } from './move';
import { validStraightMove } from './validMoves';

export const updateCastle = (user: User, move: Move) => {
  if (user.color == 'W') {
    // if it's a rook
    if (
      move.currentI == 7 &&
      move.currentJ == 0 &&
      user.canCastleLeft
    ) {
      user.canCastleLeft = false;
    } else if (
      move.currentI == 7 &&
      move.currentJ == 7 &&
      user.canCastleRight
    ) {
      user.canCastleRight = false;
    } else if (
      move.currentI == 7 &&
      move.currentJ == 4 &&
      (user.canCastleLeft || user.canCastleRight)
    ) {
      user.canCastleLeft = false;
      user.canCastleRight = false;
    }
  } else {
    if (
      move.currentI == 0 &&
      move.currentJ == 0 &&
      user.canCastleLeft
    ) {
      user.canCastleLeft = false;
    } else if (
      move.currentI == 0 &&
      move.currentJ == 7 &&
      user.canCastleRight
    ) {
      user.canCastleRight = false;
    } else if (
      move.currentI == 0 &&
      move.currentJ == 4 &&
      (user.canCastleLeft || user.canCastleRight)
    ) {
      user.canCastleLeft = false;
      user.canCastleRight = false;
    }
  }
  return;
};

const checkCastle = (
  user: User,
  board: Board,
  move: Move,
  j: number,
  castleNumber: number,
): boolean => {
  let i = move.currentI;
  const actualToJ = move.toJ;
  const piece: Piece | undefined = board.grid[i][j].piece;
  if (
    piece &&
    piece.name == 'Rook' &&
    piece.color == user.color
  ) {
    move.toJ = move.currentJ + castleNumber;
    updatePiece(move, user, board.grid);

    if (isKingInCheck(board, user)) {
      // revert the change and return false;
      updatePiece(move, user, board.grid, true);
      return false;
    } else {
      move.toJ = actualToJ;
      move.currentJ += castleNumber;
      updatePiece(move, user, board.grid);
      if (isKingInCheck(board, user)) {
        // revert the change and return false;
        updatePiece(move, user, board.grid, true);
        return false;
      }
      return true;
    }
  }
  return false;
};

export const canKingCastle = (
  board: Board,
  user: User,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, toJ] = getMove(move);

  let checkmove: Move = {
    currentI,
    currentJ,
    toI,
    toJ,
  };

  if (user.isKingInCheck) return false;
  if (currentJ > toJ && user.canCastleLeft) {
    checkmove.toJ = 1;

    if (!validStraightMove(board, checkmove)) return false;

    if (checkCastle(user, board, move, 0, -1)) {
      //update rook position too
      move.currentJ = 0;
      move.toJ += 1;
      updatePiece(move, user, board.grid);
      return true;
    }
  } else if (currentJ < toJ && user.canCastleRight) {
    checkmove.toJ = 6;
    if (!validStraightMove(board, checkmove)) return false;
    if (checkCastle(user, board, move, 7, 1)) {
      //update rook position too
      move.currentJ = 7;
      move.toJ -= 1;
      updatePiece(move, user, board.grid);
      return true;
    }
  }
  return false;
};
