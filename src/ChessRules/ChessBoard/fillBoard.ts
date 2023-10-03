import { Board } from '../Board';
import { Piece } from '../Piece';
import { placePiece } from '../updateBoard';
export const placePawns = (board: Board) => {
  for (let j = 0; j < 8; j++) {
    const whitePawn = new Piece('W', ' ♟︎ ', 'Pawn', [
      6,
      j,
    ]);
    const blackPawn = new Piece('B', ' ♟︎ ', 'Pawn', [
      1,
      j,
    ]);
    placePiece(whitePawn, 6, j, board.grid);
    placePiece(blackPawn, 1, j, board.grid);
  }
};
export const placeKing = (board: Board) => {
  const blackKing = new Piece('B', ' ♔ ', 'King', [0, 4]);

  const whiteKing = new Piece('W', ' ♔ ', 'King', [7, 4]);
  placePiece(whiteKing, 7, 4, board.grid);
  placePiece(blackKing, 0, 4, board.grid);
};
export const placeQueen = (board: Board) => {
  const blackQueen = new Piece('B', ' ♕ ', 'Queen', [0, 3]);
  const whiteQueen = new Piece('W', ' ♕ ', 'Queen', [7, 3]);
  placePiece(whiteQueen, 7, 3, board.grid);
  placePiece(blackQueen, 0, 3, board.grid);
};
export const placeRooks = (board: Board) => {
  const whiteRook = new Piece('W', ' ♜ ', 'Rook', [7, 0]);
  const blackRook = new Piece('B', ' ♜ ', 'Rook', [7, 7]);
  const whiteRook1 = new Piece('W', ' ♜ ', 'Rook', [0, 0]);
  const blackRook1 = new Piece('B', ' ♜ ', 'Rook', [0, 7]);
  placePiece(whiteRook, 7, 0, board.grid);
  placePiece(whiteRook1, 7, 7, board.grid);
  placePiece(blackRook1, 0, 0, board.grid);
  placePiece(blackRook, 0, 7, board.grid);
};
export const placeBishops = (board: Board) => {
  const whiteBishop = new Piece(
    'W',
    ' ♝ ',
    'Bishop',
    [7, 5],
  );
  const blackBishop = new Piece(
    'B',
    ' ♝ ',
    'Bishop',
    [0, 5],
  );
  const whiteBishop1 = new Piece(
    'W',
    ' ♝ ',
    'Bishop',
    [7, 2],
  );
  const blackBishop1 = new Piece(
    'B',
    ' ♝ ',
    'Bishop',
    [0, 2],
  );

  placePiece(whiteBishop, 7, 5, board.grid);
  placePiece(whiteBishop1, 7, 2, board.grid);
  placePiece(blackBishop, 0, 5, board.grid);
  placePiece(blackBishop1, 0, 2, board.grid);
};
export const placeKnights = (board: Board) => {
  const whiteKnight = new Piece(
    'W',
    ' ♞ ',
    'Knight',
    [7, 1],
  );
  const whiteKnight1 = new Piece(
    'W',
    ' ♞ ',
    'Knight',
    [7, 6],
  );
  const blackKnight = new Piece(
    'B',
    ' ♞ ',
    'Knight',
    [0, 1],
  );
  const blackKnight1 = new Piece(
    'B',
    ' ♞ ',
    'Knight',
    [0, 6],
  );
  placePiece(whiteKnight, 7, 1, board.grid);
  placePiece(whiteKnight1, 7, 6, board.grid);
  placePiece(blackKnight1, 0, 1, board.grid);
  placePiece(blackKnight, 0, 6, board.grid);
};
