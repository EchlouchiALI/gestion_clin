import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/users/user.entity'
import { RendezVous } from 'src/rendezvous/rendezvous.entity'
import { UsersModule } from 'src/users/users.module' 
import { MailModule } from 'src/mail/mail.module'
// ✅ importer le module complet

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RendezVous]),
    UsersModule, 
    MailModule,// ✅ importer ici
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
