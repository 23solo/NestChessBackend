import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { VerifyService } from './verify.service';

@Controller('verifyemail')
export class VerifyController {
  constructor(
    private readonly verifyService: VerifyService,
  ) {}

  @Get()
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const result =
        await this.verifyService.verifyEmail(token);
      // Redirect to the specified URL
      return res.redirect(result.redirectUrl);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ message: error });
    }
  }
}
