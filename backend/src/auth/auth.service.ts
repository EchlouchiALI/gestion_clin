import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/user.entity';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service'; // ✅ Import mail service

@Injectable()
export class AuthService {
  private codeMap: Map<string, string> = new Map(); // email => code temporaire

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService, // ✅ Inject mail service
  ) {}

  // ✅ Enregistrement
  async registerPatient(data: RegisterPatientDto): Promise<User> {
    const { password, ...rest } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      ...rest,
      password: hashedPassword,
      role: 'patient',
    });

    return await this.userRepo.save(newUser);
  }

  // ✅ Connexion avec JWT
  async login(data: LoginDto) {
    const user = await this.userRepo.findOneBy({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ✅ Étape 1 : Envoi du code par mail
  async sendResetCode(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new NotFoundException("Email introuvable");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.codeMap.set(email, code);

    await this.mailService.sendResetCode(email, code); // ✅ Envoi du mail
    return { message: 'Code envoyé avec succès' };
  }

  // ✅ Étape 2 : Vérification du code
  async verifyResetCode(email: string, code: string) {
    const savedCode = this.codeMap.get(email);
    if (!savedCode || savedCode !== code) {
      throw new BadRequestException("Code invalide ou expiré");
    }

    return { message: 'Code vérifié avec succès' };
  }

  // ✅ Étape 3 : Réinitialisation du mot de passe
  async resetPassword(email: string, code: string, newPassword: string) {
    const savedCode = this.codeMap.get(email);
    if (!savedCode || savedCode !== code) {
      throw new BadRequestException("Code invalide ou expiré");
    }

    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);
    this.codeMap.delete(email); // ✅ Supprime le code

    return { message: "Mot de passe mis à jour avec succès" };
  }
}
