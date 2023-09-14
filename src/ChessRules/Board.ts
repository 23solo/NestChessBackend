import { Cell } from './Cell';
import { Piece } from './Piece';
import { move } from './moves/move';
import { User } from './user/User';

export class Board {
  size: number;
  grid: Cell[][];
  constructor(size: number) {
    this.size = size;
    this.grid = this.initializeBoard(size);
  }

  initializeBoard(size: number) {
    const grid = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        let cellObj: Cell;
        if ((i + j) % 2 == 0) {
          cellObj = { color: 'W', position: [i, j] };
        } else {
          cellObj = { color: 'B', position: [i, j] };
        }
        row.push(cellObj);
      }
      grid.push(row);
    }
    return grid;
  }

  print() {
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
