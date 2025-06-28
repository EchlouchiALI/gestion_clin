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

@Controller('rendezvous')
export class RendezvousController {
  constructor(private readonly rendezvousService: RendezvousService) {}

  // ✅ [ADMIN] Lister tous les rendez-vous
  @Get('admin/all')
  async findAll() {
    return this.rendezvousService.findAllForAdmin();
  }

  // ✅ [ADMIN] Créer un rendez-vous
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

  // ✅ [ADMIN] Supprimer un rendez-vous
  @Delete('admin/:id')
  async delete(@Param('id') id: string) {
    return this.rendezvousService.delete(+id);
  }

  // ✅ [ADMIN] Modifier un rendez-vous
  @Patch('admin/:id')
  async updateRendezvous(
    @Param('id') id: string,
    @Body() body: UpdateRendezvousDto,
  ) {
    return this.rendezvousService.update(+id, body);
  }

  // ✅ [TOUS] Générer et retourner le PDF d’un RDV
  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const buffer = await this.rendezvousService.generatePdfFor(+id);
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

  // ✅ Met à jour les statuts des RDV dépassés manuellement (peut aussi être lancé par CRON)
  @Post('update-status')
  async forceUpdate() {
    return this.rendezvousService.markPastAppointments();
  }
}
