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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private userService: UsersService,
    private mailService: MailService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>, // 💡 Pour requêter les médecins
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

  // ✏️ Modifier un patient
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

  // 👨‍⚕️ Récupérer tous les médecins (depuis user)
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
  return this.userService.updatePatient(+id, body); // ou updateMedecin si tu en as un spécifique
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
