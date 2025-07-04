// src/messages/dto/create-message.dto.ts

import { IsNotEmpty } from 'class-validator'

export class CreateMessageDto {
  @IsNotEmpty()
  content: string

  @IsNotEmpty()
  receiverId: number
}
