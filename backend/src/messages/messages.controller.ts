import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { UsersService } from '../users/users.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UsersService // ✅ injection du service User
  ) {}

  // ============================
  // 📩 ROUTES POUR LES PATIENTS
  // ============================

  @Post('patient/messages')
  @Roles('patient')
  async sendMessageAsPatient(@Body() dto: CreateMessageDto, @Request() req) {
    const user = req.user as any
    return this.messagesService.sendMessage(user, dto, 'patient')
  }

  @Get('patient/messages/:medecinId')
  @Roles('patient')
  async getConversationAsPatient(@Param('medecinId') medecinId: number, @Request() req) {
    const user = req.user as any
    return this.messagesService.getConversation(user.id, medecinId)
  }

  @Post('patient/messages/demande')
  @Roles('patient')
  async envoyerDemande(@Body() body: { medecinId: number }, @Request() req) {
    const patient = req.user as any
    return this.messagesService.createDemande(patient.id, body.medecinId)
  }

  @Get('patient/conversations')
  @Roles('patient')
  async getMedecinsConversations(@Request() req) {
    const patient = req.user as any
    return this.messagesService.getConversationsForPatient(patient.id)
  }

  @Get('patient/medecins')
  @Roles('patient')
  async getAllMedecins() {
    return this.userService.findAllMedecins()
  }

  // =============================
  // 🩺 ROUTES POUR LES MÉDECINS
  // =============================

  @Get('medecin/conversations')
  @Roles('medecin')
  async getConversationsMedecin(@Request() req) {
    const medecin = req.user as any
    return this.messagesService.getConversationsForMedecin(medecin.id)
  }

  @Get('medecin/conversations/:patientId')
  @Roles('medecin')
  async getMessagesWithPatient(@Param('patientId') patientId: number, @Request() req) {
    const medecin = req.user as any
    return this.messagesService.getConversation(patientId, medecin.id)
  }

  @Post('medecin/messages')
  @Roles('medecin')
  async sendMessageAsMedecin(@Body() dto: CreateMessageDto, @Request() req) {
    const medecin = req.user as any
    return this.messagesService.sendMessage(medecin, dto, 'medecin')
  }

  @Get('medecin/demandes')
  @Roles('medecin')
  async getDemandes(@Request() req) {
    const medecin = req.user as any
    return this.messagesService.getDemandesReçues(medecin.id)
  }

  @Post('medecin/demandes/accept')
  @Roles('medecin')
  async accepterDemande(@Request() req, @Body() body: { patientId: number }) {
    const medecin = req.user as any
    return this.messagesService.acceptDemande(medecin.id, body.patientId)
  }

  @Delete('messages/:id')
  @Roles('medecin')
  async deleteMessage(@Param('id') id: number) {
    return this.messagesService.deleteMessage(+id)
  }
  @Get('patient/demandes')
@Roles('patient')
async getDemandesEnvoyees(@Request() req) {
  const patient = req.user as any
  return this.messagesService.getDemandesEnvoyeesParPatient(patient.id)
}
@Post('medecin/demandes/refuse')
@Roles('medecin')
async refuserDemande(@Request() req, @Body() body: { patientId: number }) {
  const medecin = req.user as any
  return this.messagesService.refuserDemande(medecin.id, body.patientId)
}


}
