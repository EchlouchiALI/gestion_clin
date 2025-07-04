import {
  Controller,
  Delete,
  Param,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PatientService } from './patient.service';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('medecin')
@Controller('medecin')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Delete('patients/:id')
  async deletePatient(
    @Param('id') id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const patient = await this.patientService.findOne(id);

    if (!patient || !patient.medecin || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }

    await this.patientService.delete(id);
    return { message: 'Patient supprimé' };
  }
}
