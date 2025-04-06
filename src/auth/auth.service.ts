import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  AuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    // private jwt: JwtService, Might need with frontend
    private jwt: JwtService,
    private config: ConfigService,
    private readonly mailerService: MailerService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  sendMail = async (
    userEmail: string,
    subject: string = 'Welcome : Verify your email',
    text: string = 'Hello',
    htmlData: string,
    token: string = '',
  ) => {
    if (token) {
      htmlData = htmlData.replace(/{{token}}/g, token);
    }

    const res = await this.mailerService.sendMail({
      to: userEmail,
      from: this.config.get('EMAIL'),
      subject: subject,
      text: text,
      html: htmlData,
    });
    console.log(
      'Response is ',
      res,
      res.statusCode,
      res.data,
    );
  };

  // New function to send verification email
  sendVerificationEmail = async (
    email: string,
    hashToken: string,
  ) => {
    // Customize the email subject, text, and HTML content
    const subject = 'Verify Your Email';
    const text =
      'Please verify your email by clicking the link in the email.';

    // Enhanced HTML content with inline styles
    const htmlData = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Our Service!</h2>
        <p style="color: #555;">
          Thank you for signing up! To complete your registration, please verify your email address by clicking the link below:
        </p>
        <p>
          <a href="${process.env.DOMAIN}/verifyemail?token=${hashToken}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Your Email</a>
        </p>
        <p style="color: #555;">
          Or copy and paste the link below into your browser:
        </p>
        <p style="color: #007bff;">
          ${process.env.DOMAIN}/verifyemail?token=${hashToken}
        </p>
        <p style="color: #555;">
          If you did not create an account, please ignore this email.
        </p>
        <footer style="margin-top: 20px; font-size: 0.9em; color: #777;">
          <p>Best regards,</p>
          <p>Your Company Name</p>
        </footer>
      </div>
    `;
    await this.sendMail(
      email,
      subject,
      text,
      htmlData,
      hashToken,
    );
  };

  singup = async (dto: AuthDto) => {
    // generate the pw hash
    const { email, password } = dto;
    const hashPassword = await argon.hash(password);
    console.log('Creating Hash Token !!');
    let hashToken = await argon.hash(email);

    // remove `+` from token to easily verify user
    hashToken = hashToken.replaceAll('+', '');
    // save the new user in the db

    console.log('Checking User Exists or Not');
    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new ForbiddenException({
        error: 'User Exists!! Kindly Login',
      });
    }
    console.log('Creating New User !!');
    const newUser = new this.userModel({
      email,
      password: hashPassword,
      verifyToken: hashToken,
      verifyTokenExpiry: Date.now() + 2400000,
    });
    await newUser.save();
    try {
      // Call the new function to send the verification email
      await this.sendVerificationEmail(email, hashToken);

      const response = {
        message: `User created successfully, Kindly check ${email} to verify`,
        success: true,
      };
      console.log('User Created Successfully !!');
      return response;
    } catch (error) {
      console.log("Couldn't send the mail !!", error); // Log the error for debugging
      return 500;
    }
  };

  singin = async (dto: AuthDto, res: Response) => {
    const { email, password } = dto;
    // Find the user by email
    const user = await this.userModel.findOne({ email });
    // if user not present throw exception
    console.log('Checking if user exists !!');

    if (!user) {
      throw new ForbiddenException({
        error: "User Doesn't exists!! Kindly SignUp",
      });
    }

    console.log('Checking if user is verified !!');
    if (!user.isVerified) {
      // Check if verification token has expired
      if (
        user.verifyTokenExpiry &&
        user.verifyTokenExpiry.getTime() < Date.now()
      ) {
        console.log('Token expired, generating new token');
        // Generate new verification token
        let newHashToken = await argon.hash(email);
        newHashToken = newHashToken.replaceAll('+', '');

        // Update user with new token and expiry
        await this.userModel.updateOne(
          { email },
          {
            verifyToken: newHashToken,
            verifyTokenExpiry: new Date(
              Date.now() + 2400000,
            ), // 24 hours
          },
        );

        // Resend verification email
        await this.sendVerificationEmail(
          email,
          newHashToken,
        );

        throw new ForbiddenException({
          error:
            'Verification token expired. A new verification email has been sent to your email address.',
        });
      }

      throw new ForbiddenException({
        error:
          'Kindly check your email & Verify your email...',
      });
    }
    // compare password

    console.log('Checking if pw matched !!');
    const pwMatches = await argon.verify(
      user.password,
      password,
    );
    // if pw is incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException({
        error: 'Wrong Creds: Check you password',
      });
    }

    // Add token for session

    console.log('Creating token for the user !!');
    const token = await this.signToken(email);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.FRONTEND,
    });

    // Return Success
    return res.send({
      name: email.split('@')[0],
      token: token,
    });
  };

  // Might need for keeping user logged In
  signToken = async (email: string) => {
    const payload = {
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return token;
  };

  getToken = async (req: Request) => {
    const response = {
      success: true,
    };

    if (req.cookies['token']) {
      return response;
    }

    response.success = false;
    return response;
  };

  signout = async (req: Request, res: Response) => {
    // Find the user by email
    if (req.cookies['token'] || req.body.token) {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      return res.sendStatus(200);
    }
    return res.sendStatus(403);
  };

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    // Find the user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new ForbiddenException({
        error: 'No user found with this email',
      });
    }

    // Check if there's an active reset token
    if (
      user.forgotPasswordToken &&
      user.forgotPasswordTokenExpiry &&
      user.forgotPasswordTokenExpiry.getTime() > Date.now()
    ) {
      throw new ForbiddenException({
        error:
          'A password reset link has already been sent and is still active. Please check your email or wait for the current link to expire.',
        expiresAt: user.forgotPasswordTokenExpiry,
      });
    }

    // Generate reset token
    let resetToken = await argon.hash(
      email + Date.now().toString(),
    );
    resetToken = resetToken.replaceAll('+', '');

    // Save token and expiry to user
    user.forgotPasswordToken = resetToken;
    user.forgotPasswordTokenExpiry = new Date(
      Date.now() + 3600000,
    ); // 1 hour
    await user.save();

    // Send reset password email
    const subject = 'Reset Your Password';
    const text =
      'Click the link below to reset your password';
    const htmlData = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #555;">
          We received a request to reset your password. Click the button below to verify your request:
        </p>
        <p>
          <a href="${process.env.DOMAIN}/verifyemail/verify-reset-token?token=${resetToken}" 
             style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Verify Reset Request
          </a>
        </p>
        <p style="color: #555;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #555;">
          This link will expire in 1 hour.
        </p>
      </div>
    `;

    await this.sendMail(
      email,
      subject,
      text,
      htmlData,
      resetToken,
    );

    return {
      message:
        'Password reset instructions sent to your email',
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    // Find user with valid reset token
    const user = await this.userModel.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ForbiddenException({
        error: 'Invalid or expired reset token',
      });
    }

    // Hash new password and update user
    const hashPassword = await argon.hash(newPassword);
    user.password = hashPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();

    return {
      message: 'Password reset successful',
      success: true,
    };
  }

  async changePassword(
    dto: ChangePasswordDto,
    req: Request,
  ) {
    const { newPassword } = dto;

    // Get user from token
    const token = req.cookies['token'];
    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    const payload = await this.jwt.verifyAsync(token, {
      secret: this.config.get('JWT_SECRET'),
    });

    // Find user
    const user = await this.userModel.findOne({
      email: payload.email,
    });
    if (!user) {
      throw new ForbiddenException({
        error: 'User not found',
      });
    }

    // Update password
    const hashPassword = await argon.hash(newPassword);
    user.password = hashPassword;
    await user.save();

    return {
      message: 'Password changed successfully',
      success: true,
    };
  }
}
