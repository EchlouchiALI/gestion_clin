import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { MedecinsModule } from '../medecins/medecins.module'; // ✅ ajout ici

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    MailModule,
    MedecinsModule, // ✅ ajout ici pour injecter MedecinsService
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule], // important pour être utilisé ailleurs (ex: RolesGuard)
})
export class AuthModule {}
