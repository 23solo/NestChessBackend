import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { LoggingMiddleware } from './middleware/logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: process.env.FRONTEND,
    credentials: true,
    optionSuccessStatus: 200,
  };

  app.enableCors(corsOptions);
  app.use(cookieParser());

  app.use(new LoggingMiddleware().use);

  await app.listen(3333);
}
bootstrap();
