// src/medecins/medecins.controller.ts
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
} from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MailService } from '../mail/mail.service';
import { RendezvousService } from 'src/rendezvous/rendezvous.service';
import { CreatePatientDto } from '../patient/dto/create-patient.dto';
import { PatientService } from 'src/patient/patient.service';

@UseGuards(JwtAuthGuard)
@Controller('medecin')
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
    private readonly rendezvousService: RendezvousService,
    private readonly patientService: PatientService,
  ) {}

  // 🔐 Profil médecin connecté
  @Get('me/profile')
  async getProfile(@Request() req) {
    return this.medecinsService.findOne(req.user.id);
  }

  // 🔐 Rendez-vous du médecin
  @Get('me/rendezvous')
  async getRendezvous(@Request() req) {
    return this.rendezvousService.findByMedecinId(req.user.id);
  }

  // ✅ Ajouter un patient
  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto, @Request() req) {
    return this.patientService.create(dto, req.user.id);
  }

  // ✅ Modifier un patient
  @Put('patients/:id')
  async updatePatient(
    @Param('id') id: number,
    @Body() body: any, // idéalement un UpdatePatientDto
    @Request() req,
  ) {
    return this.patientService.update(id, body);
  }

  // 🔐 ADMIN - Voir tous les médecins
  @Get('admin/medecins')
  findAll() {
    return this.medecinsService.findAll();
  }

  // 🔐 ADMIN - Ajouter médecin
  @Post('admin/medecins')
  create(@Body() body: {
    nom: string;
    prenom: string;
    email: string;
    specialite?: string;
    telephone?: string;
  }) {
    return this.medecinsService.create(body);
  }

  // 🔐 ADMIN - Supprimer médecin
  @Delete('admin/medecins/:id')
  delete(@Param('id') id: number) {
    return this.medecinsService.delete(id);
  }

  // 🔐 ADMIN - Modifier médecin
  @Put('admin/medecins/:id')
  async updateMedecin(
    @Param('id') id: string,
    @Body() body: {
      nom?: string;
      prenom?: string;
      email?: string;
      specialite?: string;
      telephone?: string;
    },
  ) {
    const updated = await this.medecinsService.update(+id, body);
    if (!updated) throw new NotFoundException('Médecin introuvable');
    return updated;
  }

  // 🔐 ADMIN - Envoyer message au médecin
  @Post('admin/medecins/message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content);
    return { message: 'Message envoyé au médecin' };
  }
}
