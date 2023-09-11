import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { AuthDto } from './dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.singup(dto);
  }

  @Post('signin')
  signin(@Body() dto: AuthDto, @Res() res: Response) {
    return this.authService.singin(dto, res);
  }

  @Post('signout')
  signout(@Res() res: Response) {
    return this.authService.signout(res);
  }

  @Post('get_token')
  getToken(@Req() req: Request) {
    return this.authService.getToken(req);
  }
}
