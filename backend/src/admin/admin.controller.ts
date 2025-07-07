import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private userService: UsersService,
    private mailService: MailService,
  ) {}

  @Get('stats')
  async getStats(@Req() req: Request) {
    return this.adminService.getFullStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Get('users/search/:query')
  searchUsers(@Param('query') query: string) {
    return this.adminService.searchUsers(query);
  }

  @Patch('users/:id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: 'admin' | 'medecin' | 'patient' },
  ) {
    return this.adminService.updateUserRole(+id, body.role);
  }

  @Get('patients')
  getAllPatients() {
    return this.userService.findAllByRole('patient');
  }

  @Delete('patients/:id')
  deletePatient(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Patch('patients/:id')
  updatePatient(
    @Param('id') id: string,
    @Body() body: {
      nom?: string;
      prenom?: string;
      email?: string;
      age?: number;
      lieuNaissance?: string;
    },
  ) {
    return this.userService.updatePatient(+id, body);
  }

  @Post('patients')
  async addPatient(@Body() body: any) {
    return this.userService.createPatient(body);
  }

  @Post('patients/message')
  sendMessageToPatient(@Body() body: { email: string; content: string }) {
    return this.mailService.sendMailToPatient(body.email, body.content);
  }

  @Get('medecins')
  getAllMedecins() {
    return this.userService.findAllByRole('medecin');
  }

  @Patch('medecins/:id')
  updateMedecin(
    @Param('id') id: string,
    @Body() body: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
      specialite?: string;
    },
  ) {
    return this.userService.updatePatient(+id, body); // ou remplace par updateMedecin si tu en as un spécifique
  }

  @Delete('medecins/:id')
  deleteMedecin(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Post('medecins/message')
  sendMessageToMedecin(@Body() body: { email: string; content: string }) {
    return this.mailService.sendMailToMedecin(body.email, body.content);
  }
}
