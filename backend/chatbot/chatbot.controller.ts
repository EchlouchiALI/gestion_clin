import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Request } from 'express';
import fetch from 'node-fetch';
import { ChatbotService } from './chatbot.service';
import { MedecinsService } from 'src/medecins/medecins.service';

const SPECIALITE_MAP: Record<string, string> = {
  // Cardiologie
  Cardiologue: 'Cardiologie',
  "spécialiste du cœur": 'Cardiologie',
  "problème cardiaque": 'Cardiologie',
  "rythme cardiaque": 'Cardiologie',

  // Dermatologie
  Dermatologue: 'Dermatologie',
  "spécialiste de la peau": 'Dermatologie',
  "problème de peau": 'Dermatologie',
  acné: 'Dermatologie',
  eczéma: 'Dermatologie',

  // Gastro-entérologie
  Gastroentérologue: 'Gastro-entérologie',
  Gastrologue: 'Gastro-entérologie',
  digestion: 'Gastro-entérologie',
  diarrhée: 'Gastro-entérologie',

  // Gynécologie
  Gynécologue: 'Gynécologie',
  gynéco: 'Gynécologie',
  "médecin pour femme": 'Gynécologie',

  // Neurologie
  Neurologue: 'Neurologie',
  migraine: 'Neurologie',
  "mal de tête": 'Neurologie',

  // ORL
  ORL: 'ORL',
  gorge: 'ORL',
  oreille: 'ORL',

  // Psychiatrie
  Psychologue: 'Psychiatrie',
  Psychiatre: 'Psychiatrie',
  anxiété: 'Psychiatrie',
  dépression: 'Psychiatrie',

  // Rhumatologie
  Rhumatologue: 'Rhumatologie',
  arthrose: 'Rhumatologie',
  rhumatisme: 'Rhumatologie',
};

@Controller('patient/chatbot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('patient')
export class ChatbotController {
  constructor(
    private configService: ConfigService,
    private chatbotService: ChatbotService,
    private medecinsService: MedecinsService,
  ) {}

  @Post('ask')
  async ask(@Body() body: { prompt: string }, @Req() req: Request) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const user = req.user as any;

    // 🔹 1. Réponse normale du chatbot
    const normalRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical qui répond en français.' },
          { role: 'user', content: body.prompt },
        ],
      }),
    });

    const dataNormal = await normalRes.json();
    const responseText = dataNormal.choices?.[0]?.message?.content ?? 'Aucune réponse.';

    // 🔹 2. Demande de spécialité
    const promptSpecialite = `Voici des symptômes : "${body.prompt}". Quelle spécialité médicale faut-il consulter ? Donne juste UN mot (ex : Cardiologue).`;
    const specRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'Tu es un assistant médical.' },
          { role: 'user', content: promptSpecialite },
        ],
      }),
    });

    const dataSpec = await specRes.json();
    const specialiteIA = dataSpec.choices?.[0]?.message?.content?.trim() ?? '';

    // 🔹 3. Nettoyage + recherche correspondance intelligente
    const cleaned = specialiteIA.toLowerCase();
    const foundKey = Object.keys(SPECIALITE_MAP).find((key) =>
      cleaned.includes(key.toLowerCase()),
    );
    const specialiteMapped = foundKey ? SPECIALITE_MAP[foundKey] : specialiteIA;

    console.log(`🧠 Spécialité IA = "${specialiteIA}" ➡️ Mappée = "${specialiteMapped}"`);

    // 🔹 4. Rechercher les médecins
    const medecins = await this.medecinsService.findBySpecialite(specialiteMapped);

    // 🔹 5. Enregistrer l’historique
    await this.chatbotService.saveMessage('user', body.prompt, user);
    await this.chatbotService.saveMessage('bot', responseText, user);

    return {
      response: responseText,
      specialite: specialiteMapped,
      medecins,
    };
  }
}
