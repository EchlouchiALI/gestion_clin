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
import { PatientModule } from '../patient/patient.module'; // ✅ import du module

@Module({
  imports: [
    TypeOrmModule.forFeature([Medecin, Patient, Ordonnance]),
    MailModule,
    RendezvousModule,
    PatientModule, // ✅ nécessaire pour injecter PatientService
  ],
  controllers: [MedecinsController, MedecinProfileController],
  providers: [MedecinsService],
  exports: [MedecinsService],
})
export class MedecinsModule {}
