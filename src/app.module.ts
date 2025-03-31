import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChessInitModule } from './chess-init/chess-init.module';
import { ChessmovesGateway } from './chessmoves/chessmoves.gateway';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { VerifyModule } from './verify/verify.module';
import { LoggerMiddleware } from './logger.middleware';
import { ChessInitService } from './chess-init/chess-init.service';
import { StockfishService } from './services/stockfish.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URL'),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'mail.privateemail.com',
          port: 587,
          auth: {
            user: configService.get('EMAIL'),
            pass: configService.get('PASS'),
          },
        },
        defaults: {
          from: `"Chessify" <no-reply@chessify.org>`,
        },
      }),
    }),
    VerifyModule,
    ChessInitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ChessmovesGateway,
    ChessInitService,
    StockfishService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Might use later
    consumer.apply(LoggerMiddleware).forRoutes('/unknown');
  }
}
