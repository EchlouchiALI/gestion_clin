import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  Put, // ✅ Import corrigé
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RendezvousService } from './rendezvous.service';
import { UpdateRendezvousDto } from './dto/update-rendezvous.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('rendezvous')
export class RendezvousController {
  constructor(private readonly rendezvousService: RendezvousService) {}

  // ✅ ADMIN - Liste de tous les rendez-vous
  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async findAll() {
    return this.rendezvousService.findAllForAdmin();
  }

  // ✅ ADMIN - Création de rendez-vous
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async create(
    @Body()
    body: {
      patientId: number;
      medecinId: number;
      date: string;
      heure: string;
      motif: string;
    },
  ) {
    return this.rendezvousService.createByAdmin(body);
  }

  // ✅ ADMIN - Suppression d’un rendez-vous
  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  async delete(@Param('id') id: string) {
    return this.rendezvousService.delete(+id);
  }

  // ✅ ADMIN - Modification d’un rendez-vous
  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id')
  async updateRendezvous(
    @Param('id') id: string,
    @Body() body: UpdateRendezvousDto,
  ) {
    return this.rendezvousService.update(+id, body);
  }

  // ✅ PATIENT - Prise de rendez-vous
  @UseGuards(JwtAuthGuard)
  @Post('patient')
  async createByPatient(
    @Body() body: { medecinId: number; date: string; heure: string },
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.rendezvousService.createByPatient({
      patientId: user.id,
      ...body,
    });
  }

  // ✅ PATIENT - Voir ses rendez-vous
  @UseGuards(JwtAuthGuard)
  @Get('patient')
  async getRdvByPatient(@Req() req: Request) {
    const user = req.user as any;
    return this.rendezvousService.findByPatient(user.id);
  }

  // ✅ MEDECIN - Voir ses rendez-vous
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Get()
  async getRendezvousForMedecin(@Req() req: Request) {
    const user = req.user as any;
    return this.rendezvousService.findByMedecin(user.id);
  }

  // ✅ ADMIN - Voir les rendez-vous d'un médecin spécifique
  @UseGuards(JwtAuthGuard)
  @Get('admin/medecin/:id')
  async findAllByMedecin(@Param('id') medecinId: string) {
    return this.rendezvousService.findByMedecin(+medecinId);
  }

  // ✅ Génération du PDF
  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const buffer = await this.rendezvousService.generatePdfFor(+id);
      if (!buffer) {
        throw new HttpException(
          'Rendez-vous introuvable',
          HttpStatus.NOT_FOUND,
        );
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=rendezvous.pdf',
      });
      res.send(buffer);
    } catch (error) {
      console.error('Erreur PDF:', error);
      throw new HttpException(
        'Erreur lors de la génération du PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ Mise à jour automatique des statuts (cron manuel)
  @UseGuards(JwtAuthGuard)
  @Post('update-status')
  async forceUpdate() {
    return this.rendezvousService.markPastAppointments();
  }

  // ✅ MEDECIN - Mise à jour du statut d’un rendez-vous
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  async updateStatut(
    @Param('id') id: string,
    @Body() body: { statut: string; notes?: string },
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.rendezvousService.updateStatut(+id, body.statut, body.notes, user.id);
  }
}
