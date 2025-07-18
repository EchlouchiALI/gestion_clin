import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailer: MailerService) {}

  async sendResetCode(email: string, code: string) {
    await this.mailer.sendMail({
      to: email,
      from: process.env.MAIL_FROM,
      subject: 'Code de récupération - Polyclinique Atlas',
      html: `<p>Voici votre code de récupération : <strong>${code}</strong></p>`,
    });
  }

  async sendMailToPatient(email: string, content: string) {
    await this.mailer.sendMail({
      to: email,
      from: process.env.MAIL_FROM,
      subject: 'Message - Polyclinique Atlas',
      html: `<p>${content}</p>`,
    });
  }

  // ✅ Envoi avec pièce jointe (PDF)
  async sendMailWithAttachment({
    to,
    subject,
    html,
    buffer,
    filename,
  }: {
    to: string;
    subject: string;
    html: string;
    buffer: Buffer;
    filename: string;
  }) {
    await this.mailer.sendMail({
      to,
      from: process.env.MAIL_FROM,
      subject,
      html,
      attachments: [
        {
          filename,
          content: buffer,
        },
      ],
    });
  }

  // ✅ Envoi message à un médecin
  async sendMailToMedecin(email: string, content: string) {
    await this.mailer.sendMail({
      to: email,
      from: process.env.MAIL_FROM,
      subject: 'Message de l’Administrateur',
      html: `<p>${content}</p>`,
    });
    return { message: 'Email envoyé avec succès' };
  }
}
