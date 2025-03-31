import { Move } from './move';
import { Board } from '../Board';
import { getMove } from './getMoves';
import { User } from '../user/User';
// Move should not be same i, j != toI, toJ toI, toJ should not have king
const validHorizontalLeftMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, toJ] = getMove(move);
  --currentJ;
  while (currentJ > toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    --currentJ;
  }
  return true;
};

const validHorizontalRightMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, _, toJ] = getMove(move);
  ++currentJ;
  while (currentJ < toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    ++currentJ;
  }
  return true;
};

const validVerticalDownMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, _] = getMove(move);
  ++currentI;
  while (currentI < toI) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    ++currentI;
  }
  return true;
};

const validVerticalTopMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, _] = getMove(move);
  --currentI;
  while (currentI > toI) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    --currentI;
  }

  return true;
};

const validDiagonalTopLeftMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, _, toJ] = getMove(move);
  --currentJ;
  --currentI;
  while (currentJ > toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    --currentJ;
    --currentI;
  }
  return true;
};

const validDiagonalTopRightMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, _, toJ] = getMove(move);
  ++currentJ;
  --currentI;
  while (currentJ < toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    ++currentJ;
    --currentI;
  }
  return true;
};

const validDiagonalDownRightMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, _, toJ] = getMove(move);
  ++currentJ;
  ++currentI;
  while (currentJ < toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    ++currentJ;
    ++currentI;
  }
  return true;
};

const validDiagonalDownLeftMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, _, toJ] = getMove(move);
  --currentJ;
  ++currentI;
  while (currentJ > toJ) {
    if (
      board.grid[currentI] &&
      board.grid[currentI][currentJ].piece
    ) {
      return false;
    }
    --currentJ;
    ++currentI;
  }
  return true;
};

// Calling the above methods on conditions
export const validStraightMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, toJ] = getMove(move);

  if (toI == currentI) {
    if (toJ > currentJ) {
      return validHorizontalRightMove(board, move);
    }
    return validHorizontalLeftMove(board, move);
  } else if (toJ == currentJ) {
    if (toI > currentI) {
      return validVerticalDownMove(board, move);
    }
    return validVerticalTopMove(board, move);
  }

  return false;
};

export const validDiagonalMove = (
  board: Board,
  move: Move,
): boolean => {
  let [currentI, currentJ, toI, toJ] = getMove(move);

  if (currentI > toI && currentJ > toJ) {
    return validDiagonalTopLeftMove(board, move);
  } else if (currentI > toI && currentJ < toJ) {
    return validDiagonalTopRightMove(board, move);
  } else if (currentI < toI && currentJ > toJ) {
    return validDiagonalDownLeftMove(board, move);
  } else if (currentI < toI && currentJ < toJ) {
    return validDiagonalDownRightMove(board, move);
  }
  return false;
};

export const isValidPawnMove = (
  board: Board,
  move: Move,
  user: User,
) => {
  const lastMove = board.lastMove;
  const piece =
    board.grid[move.currentI][move.currentJ].piece;

  if (!piece || piece.name !== 'Pawn') {
    console.log('Invalid piece selection.');
    return { isValid: false };
  }

  const isFirstMove =
    move.currentI === (user.color === 'W' ? 6 : 1);
  const forwardStep = user.color === 'W' ? -1 : 1;
  const destinationCell = board.grid[move.toI][move.toJ];

  console.log('Move Attempt:', move);

  // **Forward move (1 or 2 squares)**
  if (move.toJ === move.currentJ) {
    if (destinationCell.piece) {
      console.log('Blocked by a piece in front.');
      return { isValid: false };
    }

    if (move.toI === move.currentI + forwardStep) {
      console.log('Valid single step forward.');
      return { isValid: true };
    }

    if (
      isFirstMove &&
      move.toI === move.currentI + 2 * forwardStep
    ) {
      const intermediateI = move.currentI + forwardStep;
      if (!board.grid[intermediateI][move.toJ].piece) {
        console.log('Valid double step forward.');
        return { isValid: true };
      }
    }
  }

  // **Diagonal capture (normal capture or en passant)**
  if (
    Math.abs(move.toJ - move.currentJ) === 1 && // 🔥 Ensures only a 1-column diagonal move
    move.toI === move.currentI + forwardStep // 🔥 Ensures only a 1-row forward move
  ) {
    if (destinationCell.piece) {
      console.log('Valid diagonal capture.');
      return { isValid: true };
    }

    if (
      lastMove &&
      isEnPassant(board, move, user, lastMove)
    ) {
      console.log('Valid en passant capture.');
      const capturedPawnPosition: [number, number] = [
        move.currentI,
        move.toJ,
      ];
      return {
        isValid: true,
        enPassantCapture: capturedPawnPosition,
      };
    }
  }

  console.log('Invalid move.');
  return { isValid: false };
};

export const isEnPassant = (
  board: Board,
  move: Move,
  user: User,
  lastMove: Move,
): boolean => {
  // console.log('Board grid is', printBoard(board.grid));

  const opponentPawn =
    board.grid[move.currentI][move.toJ].piece;
  console.log(
    lastMove,
    move,
    opponentPawn,
    opponentPawn.name === 'Pawn',
    opponentPawn.color !== user.color,
    lastMove.toI === move.currentI,
  );

  if (
    opponentPawn &&
    opponentPawn.name === 'Pawn' &&
    opponentPawn.color !== user.color &&
    lastMove.toI === move.currentI && // Opponent's last move was a double step
    lastMove.toJ === move.toJ &&
    Math.abs(lastMove.toI - lastMove.currentI) === 2 // Ensure last move was a two-step forward move
  ) {
    console.log('Yayyy it is an enpassant move');
    return true; // En passant is valid
  }

  return false;
};

// export const applyMove = (
//   board: Board,
//   move: Move,
// ): void => {
//   const piece =
//     board.grid[move.currentI][move.currentJ].piece;
//   if (!piece) return;

//   // Handle en passant removal
//   if (
//     isEnPassant(board, move, {
//       name: '',
//       color: piece.color,
//       canCastleLeft: false,
//       canCastleRight: false,
//       isKingInCheck: false,
//       kingCheckedFrom: [0, 0],
//       kingPosition: [0, 0],
//       userMove: 0,
//       totalMoves: 0,
//     })
//   ) {
//     board.grid[board.lastMove!.toI][
//       board.lastMove!.toJ
//     ].piece = undefined;
//   }

//   // Move the piece
//   board.grid[move.toI][move.toJ].piece = piece;
//   board.grid[move.currentI][move.currentJ].piece =
//     undefined;

//   // Store the last move
//   board.lastMove = move;
// };

export const validKnightMove = (move: Move): boolean => {
  // Check for 8 conditions
  // ToDo: make it more generic
  let [currentI, currentJ, toI, toJ] = getMove(move);
  if (currentI + 2 == toI && currentJ + 1 == toJ) {
    return true;
  }
  if (currentI + 2 == toI && currentJ - 1 == toJ) {
    return true;
  }
  if (currentI - 2 == toI && currentJ + 1 == toJ) {
    return true;
  }
  if (currentI - 2 == toI && currentJ - 1 == toJ) {
    return true;
  }
  if (currentI + 1 == toI && currentJ + 2 == toJ) {
    return true;
  }
  if (currentI + 1 == toI && currentJ - 2 == toJ) {
    return true;
  }
  if (currentI - 1 == toI && currentJ + 2 == toJ) {
    return true;
  }
  if (currentI - 1 == toI && currentJ - 2 == toJ) {
    return true;
  }

  return false;
};
