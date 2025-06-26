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
  Req,
} from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RendezvousService } from 'src/rendezvous/rendezvous.service';

@Controller('admin/medecins')
@UseGuards(AuthGuard('jwt'))
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
    private readonly rendezvousService: RendezvousService,
  ) {}

  // 🧑‍⚕️ GET all medecins
  @Get()
  findAll() {
    return this.medecinsService.findAll();
  }

  // ➕ POST create new medecin
  @Post()
  create(
    @Body()
    body: {
      nom: string;
      prenom: string;
      email: string;
      specialite?: string;
      telephone?: string;
    },
  ) {
    return this.medecinsService.create(body);
  }

  // 🗑️ DELETE medecin
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.medecinsService.delete(id);
  }

  // ✉️ POST envoyer message par mail
  @Post('message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content);
    return { message: 'Message envoyé au médecin' };
  }

  // ✏️ PUT modifier les infos d’un médecin
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
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

  // 📅 GET tous mes rendez-vous (pour patient connecté)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyAppointments(@Req() req) {
    return this.rendezvousService.findByPatientId(req.user.id);
  }
}
