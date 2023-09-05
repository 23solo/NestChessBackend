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
        Click <a href="${process.env.DOMAIN}/verifyemail?token=${token}"> 
        here</a> to Verify your email 
      </p> or copy and pase the link below in your browser. <br>
      ${process.env.DOMAIN}/verifyemail?token=${token}`;
    this.mailerService.sendMail({
      //$argon2id$v=19$m=65536,t=3,p=4$kBcpcJRSNP1sfWjx8CajkQ$1KzNtJk+EH9WtbqTDt2j6xvBpb3RbWYLpNhe2RZWFQ8
      //$argon2id$v=19$m=65536,t=3,p=4$kBcpcJRSNP1sfWjx8CajkQ$1KzNtJkEH9WtbqTDt2j6xvBpb3RbWYLpNhe2RZWFQ8
      to: userEmail,
      from: this.config.get('EMAIL'),
      subject: 'Welcome : Verify your email',
      text: 'Hello',
      html: data,
    }); //$argon2id$v=19$m=65536,t=3,p=4$llKD+9J3XRykFNEIfI9WpQ$LYaYbh7Z1rJJfuQyf8/Q3baDChF2Ucjab6Ef1FCcQCE
  };
  singup = async (dto: AuthDto): Promise<User> => {
    // generate the pw hash
    const { email, password } = dto;
    const hashPassword = await argon.hash(password);
    let hashToken = await argon.hash(email);

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

    return savedUser;
  };
  singin = async (dto: AuthDto) => {
    // // Find the user by email
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     email: dto.email,
    //   },
    // });
    // // if user not present throw exception
    // if (!user) {
    //   throw new ForbiddenException('Wrong Creds: Check your email');
    // }
    // // compare password
    // const pwMatches = await argon.verify(user.hash, dto.password);
    // // if pw is incorrect throw exception
    // if (!pwMatches) {
    //   throw new ForbiddenException('Wrong Creds: Check you password');
    // }
    // // send back the user token
    // return this.signToken(user.id, user.email);
  };

  signToken = async (userId: number, email: string) => {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return { access_token: token };
  };
}
