import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Body,
  Patch,
  Post,
} from '@nestjs/common';
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

  // 📊 Statistiques
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // 👥 Tous les utilisateurs
  @Get('users')
  getUsers() {
    return this.adminService.getAllUsers();
  }

  // ❌ Supprimer un utilisateur
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  // 🔍 Rechercher utilisateur
  @Get('users/search/:query')
  searchUsers(@Param('query') query: string) {
    return this.adminService.searchUsers(query);
  }

  // 🔄 Modifier le rôle d’un utilisateur
  @Patch('users/:id/role')
  updateRole(
    @Param('id') id: string,
    @Body() body: { role: 'admin' | 'medecin' | 'patient' },
  ) {
    return this.adminService.updateUserRole(+id, body.role);
  }

  // 🧍‍♂️ Récupérer tous les patients
  @Get('patients')
  getAllPatients() {
    return this.userService.findAllByRole('patient');
  }

  // 🧍‍♂️ Supprimer un patient
  @Delete('patients/:id')
  deletePatient(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // ✏️ Modifier un patient ✅ (manquait dans ton code)
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

  // ➕ Ajouter un patient
  @Post('patients')
  async addPatient(@Body() body: any) {
    return this.userService.createPatient(body);
  }

  // ✉️ Envoyer message au patient
  @Post('patients/message')
  sendMessageToPatient(@Body() body: { email: string; content: string }) {
    return this.mailService.sendMailToPatient(body.email, body.content);
  }
}
