import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { PatientService } from './patient.service'
import { UsersService } from 'src/users/users.service'
import { Request as ExpressRequest } from 'express'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number
    email: string
    role: string
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly userService: UsersService,
  ) {}

  // 🔴 Supprimer un patient (côté médecin)
  @Delete('medecin/patients/:id')
  @Roles('medecin')
  async deletePatient(
    @Param('id') id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const patient = await this.patientService.findOne(id)

    if (!patient || !patient.medecin || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé')
    }

    await this.patientService.delete(id)
    return { message: 'Patient supprimé' }
  }

  // 🔵 Créer un nouveau patient (côté médecin)
  @Post('medecin/patients')
@Roles('medecin')
createPatient(@Req() req: AuthenticatedRequest, @Body() dto: CreatePatientDto) {
  return this.patientService.create(dto, req.user.id)
}

  // 🔵 Modifier un patient (côté médecin)
  @Put('medecin/patients/:id')
  @Roles('medecin')
  updatePatient(
    @Param('id') id: number,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientService.update(+id, dto)
  }

  // 🔵 Liste des médecins (visible côté patient après QCM)
  @Get('patient/medecins')
  @Roles('patient')
  async getAllMedecins() {
    return this.userService.findAllMedecins()
  }

  // 🔵 Récupérer les infos du patient connecté
  @Get('patient/profil')
  @Roles('patient')
  async getProfil(@Req() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.id)
  }

  // 🔵 Modifier les infos du patient connecté
  @Put('patient/profil')
  @Roles('patient')
  async updateProfil(@Req() req: AuthenticatedRequest, @Body() body) {
    return this.userService.update(req.user.id, body)
  }

  // 🔵 Modifier le mot de passe
  @Post('patient/change-password')
  @Roles('patient')
  async changePassword(@Req() req: AuthenticatedRequest, @Body() body) {
    return this.userService.updatePassword(req.user.id, body.newPassword)
  }

  // 🔴 Supprimer son compte (patient)
  @Delete('patient/delete')
  @Roles('patient')
  async deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.userService.remove(req.user.id)
  }
}
