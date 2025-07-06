import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientController } from './patient.controller'; // pour le médecin
import { PatientProfileController } from './patient.profile.controller'; // pour /patient/me

import { PatientService } from './patient.service';
import { UsersService } from '../users/users.service';
import { RendezvousService } from '../rendezvous/rendezvous.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

import { Patient } from './patient.entity';
import { User } from '../users/user.entity';
import { RendezVous } from '../rendezvous/rendezvous.entity';
import { Medecin } from '../medecins/medecin.entity';
import { Activity } from '../activity/activity.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User, RendezVous, Medecin,Activity]),
  ],
  controllers: [
    PatientController,          // 🔹 /medecin/patients
    PatientProfileController,   // 🔹 /patient/me
  ],
  providers: [
    PatientService,
    UsersService,
    RendezvousService,
    PdfService,
    MailService,
  ],
  exports: [PatientService],
})
export class PatientModule {}
