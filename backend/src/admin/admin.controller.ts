import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
  Patch,
  Post,
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { UsersService } from 'src/users/users.service'
import { MailService } from 'src/mail/mail.service' // ✅ correct
import { Roles } from 'src/common/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private userService: UsersService,
    private mailService: MailService, // ✅ tu dois l’injecter ici
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats()
  }

  @Get('users')
  getUsers() {
    return this.adminService.getAllUsers()
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id)
  }

  @Get('users/search/:query')
  searchUsers(@Param('query') query: string) {
    return this.adminService.searchUsers(query)
  }

  @Patch('users/:id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: 'admin' | 'medecin' | 'patient' },
  ) {
    return this.adminService.updateUserRole(+id, body.role)
  }

  @Get('patients')
  getAllPatients() {
    return this.userService.findAllByRole('patient')
  }

  @Delete('patients/:id')
  deletePatient(@Param('id') id: string) {
    return this.userService.deleteUser(id)
  }

  @Post('patients')
  async addPatient(@Body() body: any) {
    return this.userService.createPatient(body)
  }

  @Post('patients/message')
  sendMessageToPatient(@Body() body: { email: string; content: string }) {
    return this.mailService.sendMailToPatient(body.email, body.content) // ✅ ici aussi
  }
  
}
