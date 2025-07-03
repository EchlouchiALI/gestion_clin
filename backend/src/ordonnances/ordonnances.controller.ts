import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { OrdonnancesService } from './ordonnances.service'
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto'
import { Request } from 'express'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('medecin')
@Controller('medecin/ordonnances')
export class OrdonnancesController {
  constructor(private readonly ordService: OrdonnancesService) {}

  
  @Get()
async findAll(@Req() req: Request) {
  const user = req.user as any;
  console.log('📥 Médecin connecté ID =', user.id); // ✅ pas user.userId !
  return this.ordService.findByMedecin(user.id);
}


  @Post()
  async create(@Body() dto: CreateOrdonnanceDto, @Req() req: Request) {
    const user = req.user as any
    return this.ordService.createWithPdfAndMail(user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordService.findOne(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordService.delete(+id)
  }
}
