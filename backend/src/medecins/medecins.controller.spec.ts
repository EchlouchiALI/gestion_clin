import { Test, TestingModule } from '@nestjs/testing';
import { MedecinsController } from './medecins.controller'
// ✅ Nom corrigé ici

describe('MedecinController', () => {
  let controller: MedecinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedecinsController],
    }).compile();

    controller = module.get<MedecinsController>(MedecinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
