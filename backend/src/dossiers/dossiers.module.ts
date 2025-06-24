import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dossier } from './dossier.entity';
import { DossiersService } from './dossiers.service';
import { DossiersController } from './dossiers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier])], // ✅
  providers: [DossiersService],
  controllers: [DossiersController],
  exports: [TypeOrmModule],
})
export class DossiersModule {}
