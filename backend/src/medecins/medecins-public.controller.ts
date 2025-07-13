// src/medecins/medecins-public.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { User } from 'src/users/user.entity'; // ✅ On utilise User

@Controller('medecins')
export class MedecinsPublicController {
  constructor(private readonly medecinsService: MedecinsService) {}

  @Get()
  async findBySpecialite(@Query('specialite') specialite?: string): Promise<User[]> {
    if (specialite) {
      return this.medecinsService.findBySpecialite(specialite); // retourne User[]
    }
    return this.medecinsService.findAllUsers(); // retourne aussi User[]
  }
}
