import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Request } from 'express'
import fetch from 'node-fetch'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('patient')
@Controller('patient/chatbot')
export class ChatbotController {
  constructor(private configService: ConfigService) {}

  @Post('ask')
  async ask(@Body() body: { prompt: string }, @Req() req: Request) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY')
    console.log('🔐 OpenRouter API Key:', apiKey)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000', // important pour OpenRouter
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical qui répond en français.' },
          { role: 'user', content: body.prompt },
        ],
      }),
    })

    const data = await response.json()
    console.log('🧠 Réponse OpenRouter brute:', data)

    return { response: data.choices?.[0]?.message?.content ?? 'Aucune réponse.' }
  }
}
