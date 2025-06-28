// src/medecins/medecins.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
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

  @Get('me/profile')
  async getProfile(@Request() req) {
    return this.medecinsService.findOne(req.user.id);
  }

  @Get('me/rendezvous')
  async getRendezvous(@Request() req) {
    return this.rendezvousService.findByMedecinId(req.user.id);
  }

  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto, @Request() req) {
    return this.patientService.create(dto, req.user.id);
  }

  // 🔒 Routes admin (optionnelles si admin != médecin)
  @Get('admin/medecins')
  findAll() {
    return this.medecinsService.findAll();
  }

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

  @Delete('admin/medecins/:id')
  delete(@Param('id') id: number) {
    return this.medecinsService.delete(id);
  }

  @Put('admin/medecins/:id')
  async update(
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

  @Post('admin/medecins/message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content);
    return { message: 'Message envoyé au médecin' };
  }
}
