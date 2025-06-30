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
import { PatientService } from 'src/patient/patient.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('medecin')
@Controller('medecin')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // ✅ Supprimer un patient appartenant au médecin connecté
  @Delete('patients/:id')
  async deletePatient(@Param('id') id: number, @Request() req) {
    const patient = await this.patientService.findOne(id);

    // Vérifie que le patient existe et appartient bien au médecin connecté
    if (!patient || !patient.medecin || patient.medecin.id !== req.user.sub) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }

    await this.patientService.delete(id);
    return { message: 'Patient supprimé' };
  }
}
