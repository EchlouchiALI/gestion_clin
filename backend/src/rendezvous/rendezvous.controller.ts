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
  } from '@nestjs/common';
  import { Response } from 'express';
  import { RendezvousService } from './rendezvous.service';
  import { UpdateRendezvousDto } from './dto/update-rendezvous.dto';
  import { Cron } from '@nestjs/schedule';
  
  @Controller('rendezvous')
  export class RendezvousController {
    constructor(private readonly rendezvousService: RendezvousService) {}
  
    // ✅ Liste tous les RDV (admin)
    @Get('admin/all')
    async findAll() {
      return this.rendezvousService.findAllForAdmin();
    }
  
    // ✅ Créer un RDV (admin)
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
  
    // ✅ Supprimer un RDV
    @Delete('admin/:id')
    async delete(@Param('id') id: string) {
      return this.rendezvousService.delete(+id);
    }
  
    // ✅ Modifier un RDV
    @Patch('admin/:id')
async updateRendezvous(
  @Param('id') id: string,
  @Body() body: UpdateRendezvousDto,
) {
  return this.rendezvousService.update(+id, body);
}
  
    // ✅ Générer le PDF d’un RDV
    @Get('pdf/:id')
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
        throw new HttpException('Erreur génération PDF', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    @Post('update-status')
async forceUpdate() {
  return this.rendezvousService.markPastAppointments();
}
  }
  