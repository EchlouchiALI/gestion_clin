import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { RendezVous } from 'src/rendezvous/rendezvous.entity';
import { Medecin } from 'src/medecins/medecin.entity'; // 👈 AJOUT
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { MedecinsModule } from 'src/medecins/medecins.module'; // 👈 AJOUT

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RendezVous, Medecin]), // 👈 AJOUT ici aussi
    UsersModule,
    MailModule,
    MedecinsModule, // 👈 Permet d’accéder aux providers du module
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
