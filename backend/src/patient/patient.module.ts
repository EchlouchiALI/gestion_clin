import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientsController } from './patient.controller';
import { UsersService } from '../users/users.service';
import { RendezvousService } from '../rendezvous/rendezvous.service';

import { User } from '../users/user.entity';
import { RendezVous } from '../rendezvous/rendezvous.entity';
import { Medecin } from '../medecins/medecin.entity';
import { UsersModule } from '../users/users.module';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RendezVous, Medecin]), // ✅ ICI
    UsersModule,
  ],
  controllers: [PatientsController],
  providers: [UsersService, RendezvousService, PdfService, MailService],
})
export class PatientModule {}
