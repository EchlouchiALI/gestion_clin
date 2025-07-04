// src/messages/messages.controller.ts

import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('patient')
@Controller('patient/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Body() dto: CreateMessageDto, @Request() req) {
    const user = req.user as any
    return this.messagesService.sendMessage(user, dto, 'patient')
  }

  @Get(':medecinId')
  async getConversation(@Param('medecinId') medecinId: number, @Request() req) {
    const user = req.user as any
    return this.messagesService.getConversation(user.id, medecinId)
  }
}
