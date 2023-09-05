import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: [true, 'Please provide a email'], unique: true })
  email: String;

  @Prop({ required: [true, 'Please provide a password'] })
  password: String;

  @Prop({ default: false })
  isVerified: Boolean;

  @Prop({ default: false })
  isAdmin: Boolean;

  @Prop()
  forgotPasswordToken: String;

  @Prop()
  forgotPasswordTokenExpiry: Date;

  @Prop()
  verifyToken: String;

  @Prop()
  verifyTokenExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
