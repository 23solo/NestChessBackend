import { Test, TestingModule } from '@nestjs/testing';
import { ChessmovesGateway } from './chessmoves.gateway';

describe('ChessmovesGateway', () => {
  let gateway: ChessmovesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChessmovesGateway],
    }).compile();

    gateway = module.get<ChessmovesGateway>(ChessmovesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
