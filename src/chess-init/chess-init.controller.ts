import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ChessInitService } from './chess-init.service';
import { StockfishService } from 'src/services/stockfish.service';

@Controller('chess')
export class ChessInitController {
  constructor(
    private chessService: ChessInitService,
    private readonly stockfishService: StockfishService,
  ) {}

  @Get('best-move')
  async getBestMove(@Query('fen') fen: string) {
    console.log('Request fen is ', fen);
    if (!fen) {
      return { error: 'FEN string is required' };
    }
    const bestMove =
      await this.stockfishService.getBestMove(fen);
    return { bestMove };
  }

  @Post('init')
  getBoard(@Body() params) {
    return this.chessService.initBoard(params);
  }

  @Post('update')
  updateBoard(@Body() params) {
    console.log('Here', params);
    return this.chessService.checkmoves(params);
    // return this.chessService.initBoard(); // return base board for test
  }

  @Post('setuser')
  setUser(@Body() params) {
    return this.chessService.setUser(params);
    // return this.chessService.initBoard(); // return base board for test
  }
}
