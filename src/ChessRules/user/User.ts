export type User = {
  name: string;
  color: 'W' | 'B';
  canCastleLeft: boolean;
  canCastleRight: boolean;
  isKingInCheck: boolean;
  kingCheckedFrom: [number, number];
  kingPosition: [number, number];
  userMove: number;
  totalMoves: number;
  timeLeft: number;
  startTime?: number;
  socketId?: string;
};
