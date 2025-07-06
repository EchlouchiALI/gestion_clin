import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from './user.entity'
import { RendezVous } from 'src/rendezvous/rendezvous.entity'
import { Activity } from '../activity/activity.entity';  // ✅ Import de l'entité rendez-vous

@Module({
  imports: [TypeOrmModule.forFeature([User, RendezVous,Activity])], // ✅ Ajouter ici aussi
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
