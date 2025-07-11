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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { OrdonnancesService } from './ordonnances.service';
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class OrdonnancesController {
  constructor(private readonly ordService: OrdonnancesService) {}

  // ===============================
  // 🏪 MÉDECIN : CRUD ordonnances
  // ===============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Get('medecin/ordonnances')
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.ordService.findByMedecin(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Post('medecin/ordonnances')
  async create(@Body() dto: CreateOrdonnanceDto, @Req() req: Request) {
    const user = req.user as any;
    return this.ordService.createWithPdfAndMail(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Get('medecin/ordonnances/:id')
  async findOne(@Param('id') id: number) {
    return this.ordService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Delete('medecin/ordonnances/:id')
  async remove(@Param('id') id: number) {
    return this.ordService.delete(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Put('medecin/ordonnances/:id')
  async update(
    @Param('id') id: number,
    @Body() dto: CreateOrdonnanceDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.ordService.updateOrdonnance(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Post('medecin/ordonnances/:id/email')
  async envoyerEmail(@Param('id') id: number) {
    await this.ordService.sendOrdonnanceByEmail(id);
    return { message: 'Email envoyé' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('medecin')
  @Post('medecin/ordonnances/custom')
  async generateCustomOrdonnance(
    @Body() body: {
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

  // ===============================
  // 👨‍⚕️ PATIENT : Analyse IA des PDF
  // ===============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Post('patient/ordonnances')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadAndAnalyse(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const filePath = path.join(process.cwd(), file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const result = await this.ordService.analyseOrdonnance(fileBuffer);
    return { explanation: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Get('patient/ordonnances')
  async getAllAnalyses() {
    return this.ordService.getAllAnalyses();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Delete('patient/ordonnances/:id')
  async deleteAnalyse(@Param('id') id: number) {
    return this.ordService.deleteAnalyse(+id);
  }
}
