import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrdonnancesService } from './ordonnances.service';
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('medecin')
@Controller('medecin/ordonnances')
export class OrdonnancesController {
  constructor(private readonly ordService: OrdonnancesService) {}

  // 🔍 Lister toutes les ordonnances du médecin connecté
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.ordService.findByMedecin(user.id);
  }

  // ➕ Créer une ordonnance et envoyer par email
  @Post()
  async create(@Body() dto: CreateOrdonnanceDto, @Req() req: Request) {
    const user = req.user as any;
    return this.ordService.createWithPdfAndMail(user.id, dto);
  }

  // 🔍 Détail d'une ordonnance
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.ordService.findOne(+id);
  }

  // 🗑️ Supprimer une ordonnance
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.ordService.delete(+id);
  }

  // ✏️ Modifier une ordonnance
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: CreateOrdonnanceDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.ordService.updateOrdonnance(id, user.id, dto);
  }

  // 📧 Ré-envoyer une ordonnance par email
  @Post(':id/email')
  async envoyerEmail(@Param('id') id: number) {
    await this.ordService.sendOrdonnanceByEmail(id);
    return { message: 'Email envoyé' };
  }

  // 📄 Ordonnance personnalisée avec génération de PDF
  @Post('custom')
  async generateCustomOrdonnance(@Body() body: {
    nom: string;
    age: string;
    poids: string;
    medicaments: string;
    recommandations: string;
  }, @Res() res: Response) {
    const pdfBuffer = await this.ordService.generateCustomPdf(body);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ordonnance-perso.pdf',
    });
    res.send(pdfBuffer);
  }
}
