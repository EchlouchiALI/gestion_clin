import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Medecin } from './medecin.entity'
import { MedecinsService } from './medecins.service'
import { MedecinsController } from './medecins.controller'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [TypeOrmModule.forFeature([Medecin]), MailModule],
  providers: [MedecinsService],
  controllers: [MedecinsController],
  exports: [TypeOrmModule],
})
export class MedecinsModule {}
