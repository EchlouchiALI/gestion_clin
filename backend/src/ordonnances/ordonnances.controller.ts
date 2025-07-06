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

  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.ordService.findByMedecin(user.id);
  }

  @Post()
  async create(@Body() dto: CreateOrdonnanceDto, @Req() req: Request) {
    const user = req.user as any;
    return this.ordService.createWithPdfAndMail(user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.ordService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.ordService.delete(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: CreateOrdonnanceDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.ordService.updateOrdonnance(id, user.id, dto);
  }

  @Post(':id/email')
  async envoyerEmail(@Param('id') id: number) {
    await this.ordService.sendOrdonnanceByEmail(id);
    return { message: 'Email envoyé' };
  }

  @Post('custom')
  async generateCustomOrdonnance(
    @Body()
    body: {
      nom: string;
      age: string;
      poids: string;
      medicaments: string;
      recommandations: string;
    },
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.ordService.generateCustomPdf(body);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ordonnance-perso.pdf',
    });
    res.send(pdfBuffer);
  }
  
}
