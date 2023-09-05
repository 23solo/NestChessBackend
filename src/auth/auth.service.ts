import { ForbiddenException, Injectable } from '@nestjs/common';

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
    const data = 
      `<p> 
        Click <a href="${process.env.DOMAIN}/verifyemail?token=${token}"> 
        here</a> to Verify your email 
      </p>`
    this.mailerService.sendMail({
      to: userEmail,
      from: this.config.get('EMAIL'),
      subject: 'Welcome : Verify your email',
      text: 'Hello',
      html: data,
    });
  };
  singup = async (dto: AuthDto): Promise<User> => {
    // generate the pw hash
    const { email, password } = dto;
    const hashPassword = await argon.hash(password);
    const hashToken = await argon.hash(email)

    console.log(email, password);
    // save the new user in the db
    const user = await this.userModel.findOne({ email });
    console.log(user);

    if (user) {
      throw new ForbiddenException('Credentials Taken');
    }
    const newUser = new this.userModel({
      email,
      password: hashPassword,
    });
    console.log('New', newUser);

    const savedUser = await newUser.save();

    console.log('Saved', savedUser);

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
