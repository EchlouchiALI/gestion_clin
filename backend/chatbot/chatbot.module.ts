import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { UsersModule } from 'src/users/users.module';
import { MedecinsModule } from 'src/medecins/medecins.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    UsersModule,
    MedecinsModule, // ✅ Nécessaire pour injecter MedecinsService
  ],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
