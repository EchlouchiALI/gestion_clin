import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { OrdonnancesService } from './ordonnances.service';

@Controller('ordonnances')
export class OrdonnancesController {
  constructor(private readonly ordonnancesService: OrdonnancesService) {}

  @Get()
  findAll() {
    return this.ordonnancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordonnancesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.ordonnancesService.create(data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.ordonnancesService.delete(id);
  }
}
