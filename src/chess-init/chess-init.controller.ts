import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ChessInitService } from './chess-init.service';

@Controller('chess-init')
export class ChessInitController {
  constructor(private chessService: ChessInitService) {}
  @Get('')
  getBoard() {
    return this.chessService.initBoard();
  }

  @Post('')
  updateBoard(@Body() params) {
    console.log(params);

    return this.chessService.checkMoves(params);
    // return this.chessService.initBoard(); // return base board for test
  }
}
