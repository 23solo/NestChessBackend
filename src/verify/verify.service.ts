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

    // Return a response with a redirect URL
    return {
      message: 'User Verified. Please login.',
      redirectUrl: `${process.env.FRONTEND}/dashboard`, // Redirect URL
    };
  };

  verifyResetToken = async (token: string) => {
    const user = await this.userModel.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw 'Password reset token is invalid or has expired';
    }
    console.log('Token verified successfully');

    return {
      message: 'Token verified successfully',
      email: user.email,
      redirectUrl: `${process.env.FRONTEND}/reset-password`,
    };
  };
}
