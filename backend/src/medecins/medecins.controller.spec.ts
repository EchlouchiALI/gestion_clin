import { Test, TestingModule } from '@nestjs/testing';
import { MedecinsController } from './medecins.controller'
import { MedecinsService } from './medecins.service'
// ✅ Nom corrigé ici

describe('MedecinController', () => {
  let controller: MedecinsController;
  let service: { findPatientsByMedecin: jest.Mock };

  beforeEach(async () => {
    service = { findPatientsByMedecin: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedecinsController],
      providers: [{ provide: MedecinsService, useValue: service }],
    }).compile();

    controller = module.get<MedecinsController>(MedecinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return patients for the logged doctor', async () => {
    const req = { user: { id: 1 } } as any;
    await controller.getPatients(req);
    expect(service.findPatientsByMedecin).toHaveBeenCalledWith(1);
  });
});
