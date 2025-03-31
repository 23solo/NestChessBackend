import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  spawn,
  ChildProcessWithoutNullStreams,
} from 'child_process';
import * as os from 'os';

@Injectable()
export class StockfishService implements OnModuleDestroy {
  private stockfish: ChildProcessWithoutNullStreams;
  private responseCallback:
    | ((move: string) => void)
    | null = null;

  constructor() {
    this.initStockfish();
  }

  private initStockfish() {
    const stockfishPath =
      os.platform() === 'darwin'
        ? '/usr/local/bin/stockfish' // MacOS path
        : 'stockfish'; // Ubuntu (installed globally)

    this.stockfish = spawn(stockfishPath);

    this.stockfish.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Stockfish:', output);
      if (this.responseCallback) {
        const bestMoveMatch =
          output.match(/bestmove\s(\S+)/);
        if (bestMoveMatch) {
          this.responseCallback(bestMoveMatch[1]);
          this.responseCallback = null; // Reset after responding
        }
      }
    });

    this.stockfish.stderr.on('data', (data) => {
      console.error('Stockfish Error:', data.toString());
    });

    this.stockfish.on('exit', (code) => {
      console.log(`Stockfish exited with code ${code}`);
    });
  }

  getBestMove(fen: string): Promise<string> {
    return new Promise((resolve) => {
      this.responseCallback = resolve;
      this.stockfish.stdin.write(`position fen ${fen}\n`);
      this.stockfish.stdin.write('go depth 15\n');
    });
  }

  onModuleDestroy() {
    this.stockfish.kill();
  }
}
