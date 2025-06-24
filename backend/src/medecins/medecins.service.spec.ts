import { Test, TestingModule } from '@nestjs/testing';
import { MedecinsService } from './medecins.service';

describe('MedecinsService', () => {
  let service: MedecinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedecinsService],
    }).compile();

    service = module.get<MedecinsService>(MedecinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
