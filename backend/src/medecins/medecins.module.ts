import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medecin } from './medecin.entity';
import { Patient } from '../patient/patient.entity'; // ✅ corriger le chemin selon ta structure
import { Ordonnance } from '../ordonnances/ordonnance.entity';

import { MedecinsService } from './medecins.service';
import { MedecinsController } from './medecins.controller';
import { MedecinProfileController } from './medecin-profile.controller';

import { MailModule } from '../mail/mail.module';
import { RendezvousModule } from '../rendezvous/rendezvous.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medecin, Patient, Ordonnance]), // ✅ repositories injectés ici
    MailModule,
    RendezvousModule,
  ],
  providers: [MedecinsService],
  controllers: [MedecinsController, MedecinProfileController],
  exports: [MedecinsService], // ✅ exporte le service si utilisé ailleurs
})
export class MedecinsModule {}
