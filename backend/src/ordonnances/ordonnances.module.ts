import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ordonnance } from './ordonnance.entity';
import { User } from '../users/user.entity';
import { Medecin } from '../medecins/medecin.entity';
import { Activity } from '../activity/activity.entity';  // <<-- ajoute cette ligne
import { OrdonnancesService } from './ordonnances.service';
import { OrdonnancesController } from './ordonnances.controller';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { UsersModule } from '../users/users.module';
import { MedecinsModule } from '../medecins/medecins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ordonnance, User, Medecin, Activity]), // <<-- ajoute Activity ici
    UsersModule,
    MedecinsModule,
  ],
  controllers: [OrdonnancesController],
  providers: [OrdonnancesService, PdfService, MailService],
  exports: [OrdonnancesService],
})
export class OrdonnancesModule {}
