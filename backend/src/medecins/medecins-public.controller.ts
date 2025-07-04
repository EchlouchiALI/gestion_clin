// src/medecins/medecins-public.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { Medecin } from './medecin.entity';

@Controller('medecins')
export class MedecinsPublicController {
  constructor(private readonly medecinsService: MedecinsService) {}

  // 🎯 Récupérer tous les médecins ou filtrer par spécialité
  @Get()
  async findBySpecialite(@Query('specialite') specialite?: string): Promise<Medecin[]> {
    if (specialite) {
      return this.medecinsService.findBySpecialite(specialite);
    }
    return this.medecinsService.findAll(); // méthode déjà existante
  }
}
