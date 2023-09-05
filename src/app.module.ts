import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL')
      })
    }),
    MailerModule.forRootAsync({

      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: configService.get('EMAIL'),
          pass: configService.get('PASS'),
        },
      },
    })      

    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
