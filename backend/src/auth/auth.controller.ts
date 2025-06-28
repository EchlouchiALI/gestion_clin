import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Enregistrement d’un patient
  @Post('register')
  async register(@Body() body: RegisterPatientDto) {
    return await this.authService.registerPatient(body);
  }

  // ✅ Connexion (login)
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  // ✅ Étape 1 : envoi du code par mail
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email requis');
    return await this.authService.sendResetCode(body.email);
  }

  // ✅ Étape 2 : vérification du code
  @Post('verify-reset-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    return await this.authService.verifyResetCode(body.email, body.code);
  }

  // ✅ Étape 3 : nouveau mot de passe
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    return await this.authService.resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
  }
}
