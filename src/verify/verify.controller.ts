import { Controller, Get, Query } from '@nestjs/common';
import { VerifyService } from './verify.service';

@Controller('verifyemail')
export class VerifyController {
  constructor(private verifyService: VerifyService) {}

  @Get()
  verify(@Query() query: { token: any }) {
    return this.verifyService.verifyEmail(query.token);
  }
}
