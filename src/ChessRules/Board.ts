import { Cell } from './Cell';
import { Piece } from './Piece';
import { Move } from './moves/move';
import { User } from './user/User';

export class Board {
  size: number;
  grid: Cell[][];
  lastMove: Move | null; // Track the last move for en passant

  constructor(size: number) {
    this.size = size;
    this.grid = this.initializeBoard(size);
    this.lastMove = null;
  }

  initializeBoard(size: number): Cell[][] {
    const grid: Cell[][] = [];
    for (let i = 0; i < size; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < size; j++) {
        row.push({
          color: (i + j) % 2 === 0 ? 'W' : 'B',
          position: [i, j],
          piece: this.initializePiece(i, j), // Place pieces
        });
      }
      grid.push(row);
    }
    return grid;
  }

  initializePiece(i: number, j: number): Piece | undefined {
    const key = `${i}-${j}`; // Unique key for each piece

    // Place pawns
    if (i === 1)
      return {
        name: 'Pawn',
        color: 'B',
        symbol: '♟',
        position: [i, j],
        key,
      };
    if (i === 6)
      return {
        name: 'Pawn',
        color: 'W',
        symbol: '♙',
        position: [i, j],
        key,
      };

    // Place other pieces
    const backRank = [
      'Rook',
      'Knight',
      'Bishop',
      'Queen',
      'King',
      'Bishop',
      'Knight',
      'Rook',
    ];
    if (i === 0 || i === 7) {
      const color = i === 0 ? 'B' : 'W';
      return {
        name: backRank[j],
        color,
        symbol: this.getPieceSymbol(backRank[j], color),
        position: [i, j],
        key,
      };
    }

    return undefined;
  }

  getPieceSymbol(name: string, color: 'W' | 'B'): string {
    const symbols: { [key: string]: string } = {
      Pawn: color === 'W' ? '♙' : '♟',
      Rook: color === 'W' ? '♖' : '♜',
      Knight: color === 'W' ? '♘' : '♞',
      Bishop: color === 'W' ? '♗' : '♝',
      Queen: color === 'W' ? '♕' : '♛',
      King: color === 'W' ? '♔' : '♚',
    };
    return symbols[name];
  }

  getPiece(i: number, j: number): Piece | undefined {
    return this.grid[i][j]?.piece;
  }

  printBoard() {
    console.log(this.size, this.grid);

    for (let i = 0; i < this.size; i++) {
      let rowStr = '';
      for (let j = 0; j < this.size; j++) {
        const cell = this.grid[i][j];
        rowStr += cell.piece
          ? `  ${cell.piece.symbol}${cell.piece.color} `
          : `   _   `;
        // console.log(cell);
      }
      console.log(rowStr);
      console.log();
    }
  }
}
