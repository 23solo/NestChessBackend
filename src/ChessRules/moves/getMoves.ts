import { Move } from './move';

export const getMove = (move: Move) => {
  return [move.currentI, move.currentJ, move.toI, move.toJ];
};
