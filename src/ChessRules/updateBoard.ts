import { move } from './moves/move';
import { Piece } from './Piece';
import { Cell } from './Cell';
import { User } from './user/User';

export const placePiece = (
  piece: Piece,
  row: number,
  col: number,
  grid: Cell[][],
) => {
  grid[row][col].piece = piece;
  let curr_piece = grid[row][col].piece;
  if (curr_piece) {
    curr_piece.position = [row, col];
  }
  return grid;
};

export const updatePiece = (
  move: move,
  user: User,
  grid: Cell[][],
  reverse: boolean = false,
  piece: Piece | undefined = undefined,
) => {
  if (reverse) {
    let currPiece = grid[move.toI][move.toJ].piece;

    if (currPiece && currPiece.position) {
      currPiece.position = [move.currentI, move.currentJ];
      if (currPiece.name == 'King') {
        user.kingPosition = [move.currentI, move.currentJ];
      }
    }
    grid[move.currentI][move.currentJ].position = [
      move.currentI,
      move.currentJ,
    ];

    grid[move.currentI][move.currentJ].piece = currPiece;
    grid[move.toI][move.toJ].piece = piece;
    return grid;
  }

  let currPiece = grid[move.currentI][move.currentJ].piece;

  if (currPiece && currPiece.position) {
    if (currPiece.name == 'King') {
      user.kingPosition = [move.toI, move.toJ];
    }
    currPiece.position = [move.toI, move.toJ];
    grid[move.toI][move.toJ].piece = currPiece;
    grid[move.currentI][move.currentJ].piece = undefined;
    return grid;
  }
};
