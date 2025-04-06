import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Record start time
    const startTime = Date.now();

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
      const duration = Date.now() - startTime;
      console.log(
        `Response Status: ${res.statusCode} - Duration: ${duration}ms`,
      );
    });

    // Handle errors
    res.on('error', (err) => {
      const duration = Date.now() - startTime;
      console.error(
        'Response Error:',
        err,
        `- Duration: ${duration}ms`,
      );
    });

    next();
  }
}
