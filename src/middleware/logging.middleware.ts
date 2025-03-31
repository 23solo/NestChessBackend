import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log the request details
    console.log(
      `Incoming Request: ${req.method} ${
        req.url
      } ${JSON.stringify(req.params)} ${JSON.stringify(
        req.body,
      )}`,
    );

    // Capture the response
    res.on('finish', () => {
      console.log(`Response Status: ${res.statusCode}`);
    });

    // Handle errors
    res.on('error', (err) => {
      console.error('Response Error:', err);
    });

    next();
  }
}
