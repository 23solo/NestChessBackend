import { Module } from '@nestjs/common';
import { ChessInitController } from './chess-init.controller';
import { ChessInitService } from './chess-init.service';
import { StockfishService } from 'src/services/stockfish.service';

@Module({
  controllers: [ChessInitController],
  providers: [ChessInitService, StockfishService],
})
export class ChessInitModule {}
