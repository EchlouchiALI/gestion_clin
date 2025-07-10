import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Medecin } from '../medecins/medecin.entity'
import { VoiceController } from './voice.controller'
import { VoiceService } from './voice.service'

@Module({
  imports: [TypeOrmModule.forFeature([Medecin])],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}