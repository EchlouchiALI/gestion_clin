import { Test, TestingModule } from '@nestjs/testing';
import { MedecinController } from './patient.controller';
import { PatientService } from '../patient/patient.service';

describe('MedecinController', () => {
  let controller: MedecinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedecinController],
      providers: [
        {
          provide: PatientService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1, medecin: { id: 1 } }),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<MedecinController>(MedecinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
