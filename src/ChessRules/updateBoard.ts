import { Move } from './moves/move';
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
  move: Move,
  user: User,
  grid: Cell[][],
  reverse: boolean = false,
  piece: Piece | undefined = undefined,
  promotion: any = false,
) => {
  console.log('Promotion is ', promotion);

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

    // **Handle pawn promotion**
    console.log('curr piece\n\n\n', currPiece);

    if (currPiece.name === 'Pawn' && promotion) {
      const nameVal = {
        Q: 'Queen',
        R: 'Rook',
        B: 'Bishop',
        N: 'Knight',
      };
      const promotedPiece: Piece = {
        name: nameVal[promotion], // e.g., 'Q', 'R', 'B', 'N'
        color: user.color,
        position: [move.toI, move.toJ],
        symbol: ' $ ',
        key:
          user.color == 'W'
            ? promotion.toLocaleLowerCase()
            : promotion,
      };
      // public color: 'W' | 'B',
      // public symbol: string,
      // public name: string,
      // public position: [number, number],
      // public key: string,

      grid[move.toI][move.toJ].piece = promotedPiece; // Replace with promoted piece
    } else {
      currPiece.position = [move.toI, move.toJ];
      grid[move.toI][move.toJ].piece = currPiece;
    }
    grid[move.currentI][move.currentJ].piece = undefined;
    printBoard(grid);
    return grid;
  }
};

const printBoard = (grid) => {
  for (let i = 0; i < 8; i++) {
    let rowStr = '';
    for (let j = 0; j < 8; j++) {
      const cell = grid[i][j];
      rowStr += cell.piece
        ? `  ${cell.piece.symbol}${cell.piece.color} `
        : `   _   `;
      // console.log(cell);
    }
    console.log(rowStr);
    console.log();
  }
};
