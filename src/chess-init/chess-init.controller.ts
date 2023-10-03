import { Body, Controller, Post } from '@nestjs/common';
import { ChessInitService } from './chess-init.service';

@Controller('chess')
export class ChessInitController {
  constructor(private chessService: ChessInitService) {}
  @Post('init')
  getBoard(@Body() params) {
    return this.chessService.initBoard(params);
  }

  @Post('update')
  updateBoard(@Body() params) {
    // console.log('Here');
    return this.chessService.checkMoves(params);
    // return this.chessService.initBoard(); // return base board for test
  }

  @Post('setuser')
  setUser(@Body() params) {
    return this.chessService.setUser(params);
    // return this.chessService.initBoard(); // return base board for test
  }
}
