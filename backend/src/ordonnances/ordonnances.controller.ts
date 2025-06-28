import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrdonnancesService } from './ordonnances.service';

@Controller('ordonnances')
export class OrdonnancesController {
  constructor(private readonly ordonnancesService: OrdonnancesService) {}

  // 🔍 Lister toutes les ordonnances
  @Get()
  findAll() {
    return this.ordonnancesService.findAll();
  }

  // 🔍 Obtenir une ordonnance par ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordonnancesService.findOne(id);
  }

  // ➕ Créer une nouvelle ordonnance
  @Post()
  create(@Body() data: any) {
    return this.ordonnancesService.create(data);
  }

  // 🗑️ Supprimer une ordonnance
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.ordonnancesService.delete(id);
  }

  // 📄 Télécharger le PDF d’une ordonnance
  @Get('pdf/:id')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.ordonnancesService.generatePdfFor(+id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=ordonnance.pdf',
    });

    res.send(buffer);
  }
}
