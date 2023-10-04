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

  sendMail = (userEmail: string, token: string) => {
    const data = `<p> 
        Click <b><a href="${process.env.DOMAIN}/verifyemail?token=${token}"> 
        HERE</a></b> to Verify your email 
      </p> or copy and pase the link below in your browser. <br>
      ${process.env.DOMAIN}/verifyemail?token=${token}`;
    this.mailerService.sendMail({
      to: userEmail,
      from: this.config.get('EMAIL'),
      subject: 'Welcome : Verify your email',
      text: 'Hello',
      html: data,
    });
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
    this.sendMail(email, hashToken);
    const response = {
      message: `User created successfully, Kindly check ${email} to verify`,
      success: true,
    };
    console.log('User Created Successfully !!');
    return response;
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
    });

    // Return Success
    return res.send({ name: email.split('@')[0] });
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
    if (req.cookies['token']) {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      return res.sendStatus(200);
    }
    return res.sendStatus(403);
  };
}
