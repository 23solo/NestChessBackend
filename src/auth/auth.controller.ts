import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import {
  AuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.singup(dto);
  }

  @Post('signin')
  signin(@Body() dto: AuthDto, @Res() res: Response) {
    return this.authService.singin(dto, res);
  }

  @Post('sendEmail')
  sendEmail(
    @Body()
    data: {
      email: string; // Recipient's email address
      subject: string; // Subject of the email
      text: string; // Plain text version of the email
      emailData: string; // HTML content of the email
    },
  ) {
    try {
      // Get the email from the config service
      const emailFromConfig =
        this.configService.get<string>('MY_EMAIL'); // Assuming 'EMAIL' is the key in your config
      // Call the sendMail method with the provided fields
      this.authService.sendMail(
        emailFromConfig,
        data.subject, // Use the subject from the request
        data.text, // Use the text from the request
        data.emailData, // Use the HTML content from the request
      );

      return {
        message: `Email sent successfully !!!`,
        success: true,
      };
    } catch (error) {
      console.log("Couldn't send the mail !!", error);
      return {
        message: "Couldn't send the email.",
        success: false,
      };
    }
  }

  @Post('signout')
  signout(@Req() req: Request, @Res() res: Response) {
    return this.authService.signout(req, res);
  }

  @Post('get_token')
  getToken(@Req() req: Request) {
    return this.authService.getToken(req);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(dto, req);
  }
}
