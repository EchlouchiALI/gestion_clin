import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVous } from './rendezvous.entity';
import { RendezvousController } from './rendezvous.controller';
import { RendezvousService } from './rendezvous.service';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';
import { Medecin } from '../medecins/medecin.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RendezVous, Medecin, User]), // ✅ ici
    PdfModule,
    MailModule,
  ],
  controllers: [RendezvousController],
  providers: [RendezvousService],
  exports: [RendezvousService], // ✅ AJOUT OBLIGATOIRE

})
export class RendezvousModule {}
