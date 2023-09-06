import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
    let hashToken = await argon.hash(email);

    // remove `+` from token to easily verify user
    hashToken = hashToken.replace('+', '');
    // save the new user in the db
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new ForbiddenException('Credentials Taken');
    }

    const newUser = new this.userModel({
      email,
      password: hashPassword,
      verifyToken: hashToken,
      verifyTokenExpiry: Date.now() + 2400000,
    });
    const savedUser = await newUser.save();

    this.sendMail(email, hashToken);
    const response = {
      message: `User created successfully, Kindly check ${email} to verify`,
      success: true,
    };
    return response;
  };

  singin = async (dto: AuthDto) => {
    const { email, password } = dto;
    // Find the user by email
    const user = await this.userModel.findOne({ email });
    // if user not present throw exception
    if (!user) {
      throw new ForbiddenException(
        'Wrong Creds: Check your email',
      );
    }
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Kindly Verify your email...',
      );
    }
    // compare password
    const pwMatches = await argon.verify(
      user.password,
      password,
    );
    // if pw is incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException(
        'Wrong Creds: Check you password',
      );
    }
    // Return Success
    return 'SuccessFully Logged In';
  };

  // Might need for keeping user logged In
  // signToken = async (userId: number, email: string) => {
  //   const payload = {
  //     sub: userId,
  //     email,
  //   };
  //   const token = await this.jwt.signAsync(payload, {
  //     expiresIn: '1d',
  //     secret: this.config.get('JWT_SECRET'),
  //   });

  //   return { access_token: token };
  // };
}
