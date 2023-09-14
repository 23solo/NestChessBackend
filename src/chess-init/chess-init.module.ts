import { Module } from '@nestjs/common';
import { ChessInitController } from './chess-init.controller';
import { ChessInitService } from './chess-init.service';

@Module({
  controllers: [ChessInitController],
  providers: [ChessInitService]
})
export class ChessInitModule {}
