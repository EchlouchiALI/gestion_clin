import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
import { APP_GUARD } from '@nestjs/core'

// Modules internes
import { AuthModule } from './auth/auth.module'
import { MedecinsModule } from './medecins/medecins.module'
import { RendezvousModule } from './rendezvous/rendezvous.module'
import { DossiersModule } from './dossiers/dossiers.module'
import { AdminModule } from './admin/admin.module'
import { PatientModule } from './patient/patient.module'
import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule';
import { OrdonnancesModule } from './ordonnances/ordonnances.module';

// Garde de rôles
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    // Chargement global du .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Connexion à PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456789',
      database: 'clinique_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),

    // Mailer (envoi d'emails via Gmail ou SMTP)
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: process.env.MAIL_FROM || '"Polyclinique Atlas" <noreply@clinique.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    // Modules métier
    AuthModule,
    MedecinsModule,
    PatientModule,
    AdminModule,
    DossiersModule,
    RendezvousModule,
    MailModule,
    OrdonnancesModule,
    ScheduleModule.forRoot(),
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
