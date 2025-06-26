import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordonnance } from './ordonnance.entity';
import { OrdonnancesService } from './ordonnances.service';
import { OrdonnancesController } from './ordonnances.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ordonnance])],
  controllers: [OrdonnancesController],
  providers: [OrdonnancesService],
  exports: [OrdonnancesService],
})
export class OrdonnancesModule {}
