import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: process.env.FRONTEND,
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
  console.log('Cors Options is', corsOptions);

  app.enableCors(corsOptions);
  app.use(cookieParser());
  await app.listen(3333);
}
bootstrap();
