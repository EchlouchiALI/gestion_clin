import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

// 📦 Modules métier
import { AuthModule } from './auth/auth.module';
import { MedecinsModule } from './medecins/medecins.module';
import { PatientModule } from './patient/patient.module';
import { AdminModule } from './admin/admin.module';
import { DossiersModule } from './dossiers/dossiers.module';
import { RendezvousModule } from './rendezvous/rendezvous.module';
import { MailModule } from './mail/mail.module';
import { OrdonnancesModule } from './ordonnances/ordonnances.module';
import { MessagesModule } from './messages/messages.module';
import { ActivityModule } from './activity/activity.module';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { ChatModule } from './chat/chat.module';

// 🧠 Entité utilisée ailleurs
import { OrdonnanceAnalyse } from './ordonnance-analyse/ordonnance-analyse.entity'; // ✅ tu peux garder cet import pour TypeORM

// 🔐 Garde de rôles
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // 🌍 Chargement du .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 🗃️ Connexion PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456789',
      database: 'clinique_db',
      autoLoadEntities: true, // ✅ toutes les entités sont automatiquement reconnues
      synchronize: true,
    }),

    // 🔐 JWT config
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-default',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),

    // 📧 Configuration Mailer
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
        options: { strict: true },
      },
    }),

    // 🚀 Tous les modules métier
    AuthModule,
    MedecinsModule,
    PatientModule,
    AdminModule,
    DossiersModule,
    RendezvousModule,
    MailModule,
    OrdonnancesModule,
    MessagesModule,
    ActivityModule,
    ChatbotModule,
    ChatModule,
    OrdonnanceAnalyse,
    // ⏰ Tâches planifiées
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
