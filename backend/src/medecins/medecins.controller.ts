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
} from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from '../mail/mail.service';

@Controller('admin/medecins')
@UseGuards(AuthGuard('jwt')) // Protège toutes les routes avec JWT
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
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
}
