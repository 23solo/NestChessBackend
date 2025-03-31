import {
  isValidPawnMove,
  validDiagonalMove,
  validKnightMove,
  validStraightMove,
} from './validMoves';
import { Piece } from '../Piece';
import { Move } from './move';
import { Board } from '../Board';
import { User } from '../user/User';
import { canKingCastle } from './castle';
import { getMove } from './getMoves';

const validateBasicCheck = (
  board: Board,
  move: Move,
  user: User,
): boolean => {
  const piece: Piece | undefined =
    board.grid[move.currentI][move.currentJ].piece;
  // cell should have piece
  if (!piece) {
    return false;
  }
  // move piece should belong to user
  if (piece && piece.color != user.color) {
    return false;
  }
  const toPiece: Piece | undefined =
    board.grid[move.toI][move.toJ].piece;
  // can't remove king
  if (toPiece) {
    if (
      toPiece.name == 'King' ||
      toPiece.color == piece.color
    ) {
      return false;
    }
  }
  return true;
};

export const validPieceMove = (
  move: Move,
  board: Board,
  user: User,
) => {
  if (!validateBasicCheck(board, move, user)) {
    return false;
  }
  const piece: Piece | undefined =
    board.grid[move.currentI][move.currentJ].piece;
  if (!piece) {
    return false;
  }

  if (piece.name == 'Bishop') {
    if (
      Math.abs(move.toI - move.currentI) ==
      Math.abs(move.toJ - move.currentJ)
    ) {
      return validDiagonalMove(board, move);
    }
    return false;
  } else if (piece.name == 'Rook') {
    return validStraightMove(board, move);
  } else if (piece.name == 'Queen') {
    if (
      Math.abs(move.toI - move.currentI) ==
      Math.abs(move.toJ - move.currentJ)
    ) {
      return validDiagonalMove(board, move);
    }
    return validStraightMove(board, move);
  } else if (piece.name == 'Pawn') {
    const result = isValidPawnMove(board, move, user);
    console.log(result);

    if (result.isValid) {
      if (result.enPassantCapture) {
        const [captureI, captureJ] =
          result.enPassantCapture;
        board.grid[captureI][captureJ].piece = undefined; // Remove the captured pawn
      }
    }
    return result.isValid;
  } else if (piece.name == 'Knight') {
    if (
      Math.abs(move.currentI - move.toI) +
        Math.abs(move.currentJ - move.toJ) !=
      3
    ) {
      return false;
    }

    return validKnightMove(move);
  } else if (piece.name == 'King') {
    let [currentI, currentJ, toI, toJ] = getMove(move);
    if (toI == currentI && Math.abs(currentJ - toJ) == 2) {
      // ToDo user is only used here / can optimise
      return canKingCastle(board, user, move);
    }
    if (
      Math.abs(toI - currentI) > 1 ||
      Math.abs(currentJ - toJ) > 1
    ) {
      return false;
    }
    return true;
  }
  return false;
};
