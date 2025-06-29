import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RendezvousService } from './rendezvous.service';
import { UpdateRendezvousDto } from './dto/update-rendezvous.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('rendezvous') // ✅ on ne protège pas tout le contrôleur d’un coup
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
  async create(@Body() body: {
    patientId: number;
    medecinId: number;
    date: string;
    heure: string;
    motif: string;
  }) {
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

  // ❌ Ne pas protéger cette route : accessible sans token
  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const buffer = await this.rendezvousService.generatePdfFor(+id);

      if (!buffer) {
        throw new HttpException('Rendez-vous introuvable', HttpStatus.NOT_FOUND);
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

  // ✅ Mise à jour des statuts des RDV (par CRON ou admin)
  @UseGuards(JwtAuthGuard)
  @Post('update-status')
  async forceUpdate() {
    return this.rendezvousService.markPastAppointments();
  }
}
