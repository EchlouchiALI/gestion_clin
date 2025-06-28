import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common'
import { MedecinsService } from './medecins.service'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { MailService } from '../mail/mail.service'
import { RendezvousService } from 'src/rendezvous/rendezvous.service'
import { CreatePatientDto } from '../patient/dto/create-patient.dto'
import { UpdatePatientDto } from '../patient/dto/update-patient.dto'
import { PatientService } from 'src/patient/patient.service'

@UseGuards(JwtAuthGuard)
@Controller('medecin')
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
    private readonly rendezvousService: RendezvousService,
    private readonly patientService: PatientService,
  ) {}

  // 🔐 Obtenir le profil du médecin connecté
  @Get('me/profile')
  async getProfile(@Request() req) {
    return this.medecinsService.findOne(req.user.id)
  }

  // 🔐 Obtenir les rendez-vous du médecin connecté
  @Get('me/rendezvous')
  async getRendezvous(@Request() req) {
    return this.rendezvousService.findByMedecinId(req.user.id)
  }

  // ✅ Ajouter un nouveau patient pour le médecin connecté
  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto, @Request() req) {
    return this.patientService.create(dto, req.user.id)
  }

  // ✅ Modifier un patient du médecin connecté
  @Put('patients/:id')
  async updatePatient(
    @Param('id') id: number,
    @Body() body: UpdatePatientDto,
    @Request() req,
  ) {
    const patient = await this.patientService.findOne(id)
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé')
    }
    return this.patientService.update(id, body)
  }

  // ✅ Supprimer un patient du médecin connecté
  @Delete('patients/:id')
  async deletePatient(@Param('id') id: number, @Request() req) {
    const patient = await this.patientService.findOne(id)
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé')
    }
    await this.patientService.delete(id)
    return { message: 'Patient supprimé' }
  }

  // ✅ Envoyer un message à un patient du médecin connecté
  @Post('patients/:id/message')
  async sendMessageToPatient(
    @Param('id') id: number,
    @Body() body: { content: string },
    @Request() req,
  ) {
    const patient = await this.patientService.findOne(id)
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé')
    }
    await this.mailService.sendMailToPatient(patient.email, body.content)
    return { message: 'Message envoyé au patient' }
  }

  // 👨‍⚕️ ADMIN - Obtenir tous les médecins
  @Get('admin/medecins')
  findAll() {
    return this.medecinsService.findAll()
  }

  // 👨‍⚕️ ADMIN - Ajouter un médecin
  @Post('admin/medecins')
  create(@Body() body: {
    nom: string
    prenom: string
    email: string
    specialite?: string
    telephone?: string
  }) {
    return this.medecinsService.create(body)
  }

  // 👨‍⚕️ ADMIN - Supprimer un médecin
  @Delete('admin/medecins/:id')
  delete(@Param('id') id: number) {
    return this.medecinsService.delete(id)
  }

  // 👨‍⚕️ ADMIN - Modifier un médecin
  @Put('admin/medecins/:id')
  async updateMedecin(
    @Param('id') id: string,
    @Body() body: {
      nom?: string
      prenom?: string
      email?: string
      specialite?: string
      telephone?: string
    },
  ) {
    const updated = await this.medecinsService.update(+id, body)
    if (!updated) throw new NotFoundException('Médecin introuvable')
    return updated
  }

  // 👨‍⚕️ ADMIN - Envoyer un message à un médecin
  @Post('admin/medecins/message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content)
    return { message: 'Message envoyé au médecin' }
  }

  // 👨‍⚕️ ADMIN - Obtenir tous les patients
  @Get('admin/patients')
  getAllPatients() {
    return this.patientService.findAll()
  }
}
