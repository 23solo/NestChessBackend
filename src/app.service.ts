import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    console.log(
      'Domain is',
      this.configService.get('DOMAIN'),
    );
    return 'Hello World!';
  }
}
