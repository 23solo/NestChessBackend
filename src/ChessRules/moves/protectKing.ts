import { Board } from '../Board';
import { Piece } from '../Piece';
import { updatePiece } from '../updateBoard';
import { User } from '../user/User';
import { isKingInCheck } from './kingCheck';
import { Move } from './move';
import { validPieceMove } from './validatePieceMoves';

const getMove = (
  fromPosition: [number, number],
  toPosition: [number, number],
  checkKing = true,
): Move => {
  let toI = fromPosition[0] + toPosition[0],
    toJ = fromPosition[1] + toPosition[1];
  if (checkKing) {
    return {
      currentI: fromPosition[0],
      currentJ: fromPosition[1],
      toI: toI,
      toJ: toJ,
    };
  }
  return {
    currentI: fromPosition[0],
    currentJ: fromPosition[1],
    toI: toPosition[0],
    toJ: toPosition[1],
  };
};

const checkPieceBlock = (
  allBlockPosition: [number, number][],
  board: Board,
  user: User,
  userPieces: Piece[],
): boolean => {
  for (let curr_position in allBlockPosition) {
    for (let curr_piece in userPieces) {
      console.log(
        'Checking curr position with piece',
        curr_position,
        curr_piece,
      );

      let checkmove: Move = getMove(
        userPieces[curr_piece].position,
        allBlockPosition[curr_position],
        false,
      );
      if (checkValidMove(checkmove, board, user)) {
        return true;
      }
    }
  }
  return false;
};

const checkValidMove = (
  checkmove: Move,
  board: Board,
  user: User,
): boolean => {
  if (validPieceMove(checkmove, board, user)) {
    let piece: Piece | undefined =
      board.grid[checkmove.toI][checkmove.toJ].piece;
    const prevUserKingCheckFrom = user.kingCheckedFrom;
    updatePiece(checkmove, user, board.grid);
    console.log('User currently is ', user);

    if (isKingInCheck(board, user)) {
      // revert the move
      console.log(
        'checking and revertinh move ',
        checkmove,
        piece,
      );

      updatePiece(checkmove, user, board.grid, true, piece);
      user.kingCheckedFrom = prevUserKingCheckFrom;
      return false;
    } else {
      // revert your move and return true that valid move exists
      console.log('this move saves king', checkmove);

      updatePiece(checkmove, user, board.grid, true, piece);
      user.kingCheckedFrom = prevUserKingCheckFrom;
      return true;
    }
  }
  return false;
};

const canRemoveKnight = (
  board: Board,
  user: User,
  userPieces: Piece[],
): boolean => {
  for (let i in userPieces) {
    let checkmove: Move = getMove(
      userPieces[i].position,
      user.kingCheckedFrom,
      false,
    );
    if (checkValidMove(checkmove, board, user)) {
      return true;
    }
  }
  return false;
};

const basicCheck = (toIndex: [number, number]): boolean => {
  const i = toIndex[0],
    j = toIndex[1];
  if (i >= 8 || i < 0) {
    return false;
  } else if (j >= 8 || j < 0) {
    return false;
  }
  return true;
};

const getAllSavingKingPosition = (
  board: Board,
  attackingPiecePosition: [number, number],
  kingPosition: [number, number],
): [number, number][] => {
  let [kingI, kingJ, pieceI, pieceJ] = [
    kingPosition[0],
    kingPosition[1],
    attackingPiecePosition[0],
    attackingPiecePosition[1],
  ];
  let allPositions: [number, number][] = [];
  // is king attacked from diagonal
  console.log(
    'King positions is',
    kingI,
    kingJ,
    pieceI,
    pieceJ,
  );
  //  kingI = 6
  // kingJ = 5
  // pieceI = 4
  // pieceJ = 7
  if (
    Math.abs(kingI - pieceI) == Math.abs(kingJ - pieceJ)
  ) {
    if (kingI < pieceI) {
      // check right down diagonal
      if (kingJ < pieceJ) {
        kingJ++, kingI++;
        while (kingI <= pieceI && kingJ <= pieceJ) {
          allPositions.push([kingI, kingJ]);
          kingJ++, kingI++;
        }
      }

      // check left down diagonal
      else if (kingJ > pieceJ) {
        kingI++, kingJ--;
        while (kingI <= pieceI && kingJ >= pieceJ) {
          allPositions.push([kingI, kingJ]);
          kingI++, kingJ--;
        }
      }
    } else {
      if (kingJ < pieceJ) {
        kingJ++, kingI--;
        while (kingI >= pieceI && kingJ <= pieceJ) {
          // <-- `>=` instead of `<=`
          allPositions.push([kingI, kingJ]);
          kingJ++, kingI--;
        }
      }

      // check left up diagonal
      else if (kingJ > pieceJ) {
        kingI--, kingJ--;
        while (kingI >= pieceI && kingJ >= pieceJ) {
          // <-- `>=` instead of `<=`
          allPositions.push([kingI, kingJ]);
          kingI--, kingJ--;
        }
      }
    }
  }

  // is king attacked from straight
  // both on same row
  else if (kingI == pieceI) {
    if (kingJ < pieceJ) {
      kingJ++;
      while (kingJ <= pieceJ) {
        allPositions.push([kingI, kingJ]);
        kingJ++;
      }
    } else {
      kingJ--;
      while (kingJ >= pieceJ) {
        allPositions.push([kingI, kingJ]);
        kingJ--;
      }
    }
  }
  // Both on same column
  else if (kingJ == pieceJ) {
    if (kingI < pieceI) {
      kingI++;
      while (kingI <= pieceI) {
        allPositions.push([kingI, kingJ]);
        kingI++;
      }
    } else {
      kingI--;
      while (kingI >= pieceI) {
        allPositions.push([kingI, kingJ]);

        kingI--;
      }
    }
  }

  return allPositions;
};

const canKingMove = (board: Board, user: User): boolean => {
  let allKingMoves: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [-1, -1],
    [1, 1],
  ];
  for (let i in allKingMoves) {
    let checkmove: Move;
    checkmove = getMove(user.kingPosition, allKingMoves[i]);

    if (basicCheck([checkmove.toI, checkmove.toJ])) {
      if (checkValidMove(checkmove, board, user)) {
        return true;
      }
    }
  }
  return false;
};

export const canProtectKing = (
  board: Board,
  user: User,
): boolean => {
  let userPieces: Piece[] = [];
  const attackingPiece: Piece | undefined =
    board.grid[user.kingCheckedFrom[0]][
      user.kingCheckedFrom[1]
    ].piece;

  // ToDO: this can be optimised by keeping track of user pieces from the start
  // add all user pieces to a list
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let curr_piece: Piece | undefined =
        board.grid[i][j].piece;
      if (curr_piece) {
        userPieces.push(curr_piece);
      }
    }
  }

  // check if any valid king move is possible

  if (canKingMove(board, user)) {
    console.log('King can Move');
    return true;
  }

  // If it's knight then it can't be blocked
  if (attackingPiece && attackingPiece.name == 'Knight') {
    // check if any piece can remove knight
    if (canRemoveKnight(board, user, userPieces)) {
      console.log('Knight can be removed');
      return true;
    }
    console.log("Knight can't be removed");
    return false;
  }
  // if not knight getAllSavingPositions

  let allBlockPosition = getAllSavingKingPosition(
    board,
    user.kingCheckedFrom,
    user.kingPosition,
  );
  console.log(
    'All block saving positions',
    allBlockPosition,
  );

  if (
    checkPieceBlock(
      allBlockPosition,
      board,
      user,
      userPieces,
    )
  ) {
    return true;
  }

  // if knight check if any piece can remove it

  // else return false king is Busted

  return false;
};
