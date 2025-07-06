import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medecin } from './medecin.entity';
import { Patient } from '../patient/patient.entity';
import { Ordonnance } from '../ordonnances/ordonnance.entity';

import { MedecinsService } from './medecins.service';
import { MedecinsController } from './medecins.controller';
import { MedecinProfileController } from './medecin-profile.controller';

import { MailModule } from '../mail/mail.module';
import { RendezvousModule } from '../rendezvous/rendezvous.module';
import { PatientModule } from '../patient/patient.module';
import { PdfModule } from '../pdf/pdf.module'; 
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medecin, Patient, Ordonnance,User]),
    MailModule,
    RendezvousModule,
    PatientModule,
    PdfModule, // ✅ Pour injecter PdfService dans MedecinsController
  ],
  controllers: [MedecinsController, MedecinProfileController],
  providers: [MedecinsService],
  exports: [MedecinsService], // ✅ Pour l’utiliser ailleurs (ex: AuthService)
})
export class MedecinsModule {}
