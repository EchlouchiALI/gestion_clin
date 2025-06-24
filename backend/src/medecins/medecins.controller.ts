import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { MedecinsService } from './medecins.service'
import { AuthGuard } from '@nestjs/passport'
import { MailService } from '../mail/mail.service'

@Controller('admin/medecins')
@UseGuards(AuthGuard('jwt')) // adapte selon ta stratégie d'authentification
export class MedecinsController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  findAll() {
    return this.medecinsService.findAll()
  }

  @Post()
  create(
    @Body()
    body: {
      nom: string
      prenom: string
      email: string
      specialite?: string
      telephone?: string
    },
  ) {
    return this.medecinsService.create(body)
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.medecinsService.delete(id)
  }

  @Post('message')
  async sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    await this.mailService.sendMailToPatient(body.email, body.content)
    return { message: 'Message envoyé au médecin' }
  }
}
