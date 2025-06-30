import { Test, TestingModule } from '@nestjs/testing';
import { MedecinsController } from './medecins.controller';
import { MedecinsService } from './medecins.service';

describe('MedecinsController', () => {
  let controller: MedecinsController;
  let medecinsService: MedecinsService;

  beforeEach(async () => {
    const medecinsServiceMock = {
      findPatientsByMedecin: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedecinsController],
      providers: [{ provide: MedecinsService, useValue: medecinsServiceMock }],
    }).compile();

    controller = module.get<MedecinsController>(MedecinsController);
    medecinsService = module.get<MedecinsService>(MedecinsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return patients for the logged doctor', async () => {
    const req = { user: { id: 1 } } as any;

    // Utiliser la méthode correcte 'getMyPatients' au lieu de 'getPatients'
    const result = await controller.getMyPatients(req);

    expect(medecinsService.findPatientsByMedecin).toHaveBeenCalledWith(1);
    expect(result).toEqual([]);
  });
});
