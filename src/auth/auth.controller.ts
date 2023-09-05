import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
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
  signin(@Body() dto: AuthDto) {
    return this.authService.singin(dto);
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
