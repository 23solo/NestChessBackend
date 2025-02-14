import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthDto } from './dto';
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

    await this.mailerService.sendMail({
      to: userEmail,
      from: this.config.get('EMAIL'),
      subject: subject,
      text: text,
      html: htmlData,
    });
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
      throw new ForbiddenException({
        error: 'Kindly Verify your email...',
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
}
