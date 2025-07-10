import { Controller, Post, Body } from '@nestjs/common'
import { VoiceService } from './voice.service'

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('parse')
  async parse(@Body('text') text: string) {
    const result = await this.voiceService.parseCommand(text.toLowerCase())
    if (!result) {
      return { error: "Commande non reconnue" }
    }
    return result
  }
}