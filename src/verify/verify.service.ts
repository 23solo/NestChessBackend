import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class VerifyService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  verifyEmail = async (token: any) => {
    console.log(token);

    const user = await this.userModel.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      throw 'Token Is not Valid';
    }
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();
    return 'User Verified Please login';
  };
}
