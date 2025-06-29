import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedecinController } from './patient.controller';

import { PatientService } from './patient.service';
import { Patient } from './patient.entity';

import { UsersService } from '../users/users.service';
import { RendezvousService } from '../rendezvous/rendezvous.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

import { User } from '../users/user.entity';
import { RendezVous } from '../rendezvous/rendezvous.entity';
import { Medecin } from '../medecins/medecin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User, RendezVous, Medecin]),
  ],
  controllers: [MedecinController],

  providers: [PatientService, UsersService, RendezvousService, PdfService, MailService],
  exports: [PatientService],
})
export class PatientModule {} // ✅ exporté correctement
