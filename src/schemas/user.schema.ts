import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({
    required: [true, 'Please provide a email'],
    unique: true,
  })
  email: string;

  @Prop({ required: [true, 'Please provide a password'] })
  password: string;

  @Prop({ default: false })
  isVerified: Boolean;

  @Prop({ default: false })
  isAdmin: Boolean;

  @Prop()
  forgotPasswordToken: string;

  @Prop()
  forgotPasswordTokenExpiry: Date;

  @Prop()
  verifyToken: string;

  @Prop()
  verifyTokenExpiry: Date;
}

export const UserSchema =
  SchemaFactory.createForClass(User);
