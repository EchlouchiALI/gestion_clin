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
  StreamableFile,
} from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MailService } from '../mail/mail.service';
import { RendezvousService } from 'src/rendezvous/rendezvous.service';
import { CreatePatientDto } from '../patient/dto/create-patient.dto';
import { UpdatePatientDto } from '../patient/dto/update-patient.dto';
import { PatientService } from 'src/patient/patient.service';
import { PdfService } from '../pdf/pdf.service';

@UseGuards(JwtAuthGuard)
@Controller('medecin')
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
    private readonly rendezvousService: RendezvousService,
    private readonly patientService: PatientService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('me/profile')
  async getProfile(@Request() req) {
    return this.medecinsService.findOne(req.user.id);
  }

  @Get('me/rendezvous')
  async getRendezvous(@Request() req) {
    return this.rendezvousService.findByMedecinId(req.user.id);
  }

  @Get('patients')
  async getMyPatients(@Request() req) {
    return this.patientService.findByMedecinId(req.user.id);
  }

  @Post('patients')
  async createPatient(@Body() dto: CreatePatientDto, @Request() req) {
    console.log("✅ Données reçues pour création patient :", dto);
    return this.patientService.create(dto, req.user.id);
  }

  @Get('patients/:id')
  async getPatient(@Param('id') id: number, @Request() req) {
    const patient = await this.patientService.findOne(id);
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }
    return patient;
  }

  @Put('patients/:id')
  async updatePatient(
    @Param('id') id: number,
    @Body() body: UpdatePatientDto,
    @Request() req,
  ) {
    const patient = await this.patientService.findOne(id);
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }
    return this.patientService.update(id, body);
  }

  @Delete('patients/:id')
  async deletePatient(@Param('id') id: number, @Request() req) {
    const patient = await this.patientService.findOne(id);
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }
    await this.patientService.delete(id);
    return { message: 'Patient supprimé' };
  }

  @Post('patients/:id/message')
  async sendMessageToPatient(
    @Param('id') id: number,
    @Body() body: { content: string },
    @Request() req,
  ) {
    const patient = await this.patientService.findOne(id);
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }

    try {
      await this.mailService.sendMailToPatient(patient.email, body.content);
      return { message: 'Message envoyé au patient' };
    } catch (error) {
      console.error('Erreur envoi mail :', error);
      throw new Error("Impossible d'envoyer le message");
    }
  }

  @Get('patients/:id/pdf')
  async generatePatientPdf(@Param('id') id: number, @Request() req) {
    const patient = await this.patientService.findOne(id);
    if (!patient || patient.medecin.id !== req.user.id) {
      throw new NotFoundException('Patient introuvable ou non autorisé');
    }

    const buffer = await this.pdfService.generatePatientPDF(patient);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename=patient-${id}.pdf`,
    });
  }

  // Partie Admin

  @Get('admin/medecins')
  findAllMedecins() {
    return this.medecinsService.findAll();
  }

  @Post('admin/medecins')
  createMedecin(@Body() body: {
    nom: string;
    prenom: string;
    email: string;
    specialite?: string;
    telephone?: string;
  }) {
    return this.medecinsService.create(body);
  }

  @Put('admin/medecins/:id')
  async updateMedecin(
    @Param('id') id: number,
    @Body() body: {
      nom?: string;
      prenom?: string;
      email?: string;
      specialite?: string;
      telephone?: string;
    },
  ) {
    const updated = await this.medecinsService.update(id, body);
    if (!updated) throw new NotFoundException('Médecin introuvable');
    return updated;
  }

  @Delete('admin/medecins/:id')
  deleteMedecin(@Param('id') id: number) {
    return this.medecinsService.delete(id);
  }

  @Post('admin/medecins/message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content);
    return { message: 'Message envoyé au médecin' };
  }

  @Get('admin/patients')
  getAllPatients() {
    return this.patientService.findAll();
  }
}
