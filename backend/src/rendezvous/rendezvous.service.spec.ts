import { Test, TestingModule } from '@nestjs/testing';
import { RendezvousService } from './rendezvous.service';

describe('RendezvousService', () => {
  let service: RendezvousService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RendezvousService],
    }).compile();

    service = module.get<RendezvousService>(RendezvousService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
