import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordonnance } from './ordonnance.entity';
import { PdfService } from '../pdf/pdf.service';
import { User } from '../users/user.entity';
import { Medecin } from '../medecins/medecin.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdonnancesService {
  constructor(
    @InjectRepository(Ordonnance)
    private readonly ordonnanceRepository: Repository<Ordonnance>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,

    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) {}

  findAll(): Promise<Ordonnance[]> {
    return this.ordonnanceRepository.find({
      relations: ['patient', 'medecin'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ordonnance> {
    const ordonnance = await this.ordonnanceRepository.findOne({
      where: { id },
      relations: ['patient', 'medecin'],
    });

    if (!ordonnance) {
      throw new NotFoundException('Ordonnance non trouvée');
    }

    return ordonnance;
  }

  async create(data: Partial<Ordonnance>): Promise<Ordonnance> {
    const patient = await this.userRepo.findOne({ where: { id: data.patient?.id } });
    const medecin = await this.medecinRepo.findOne({ where: { id: data.medecin?.id } });

    if (!patient || !medecin) {
      throw new NotFoundException('Patient ou médecin introuvable');
    }

    const ordonnance = this.ordonnanceRepository.create({
      ...data,
      patient,
      medecin,
      date: new Date().toISOString().slice(0, 10),
    });

    const saved = await this.ordonnanceRepository.save(ordonnance);

    const pdfBuffer = await this.pdfService.generateOrdonnancePDF({
      id: saved.id,
      date: saved.date,
      patient: {
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
      },
      medecin: {
        nom: medecin.nom,
        prenom: medecin.prenom,
        specialite: medecin.specialite,
      },
      prescription: saved.contenu,
    });

    await this.mailService.sendMailWithAttachment({
      to: patient.email,
      subject: 'Votre ordonnance – Polyclinique Atlas',
      html: `
        <p>Bonjour ${patient.prenom},</p>
        <p>Voici votre ordonnance transmise par votre médecin.</p>
        <p>Vous la trouverez en pièce jointe (PDF).</p>
        <br/>
        <p style="font-size: 0.9rem; color: gray;">Polyclinique Atlas</p>
      `,
      buffer: pdfBuffer,
      filename: `ordonnance-${saved.id}.pdf`,
    });

    return saved;
  }

  async delete(id: number) {
    const found = await this.ordonnanceRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('Ordonnance non trouvée');
    }
    await this.ordonnanceRepository.remove(found);
    return { message: 'Ordonnance supprimée' };
  }

  async generatePdfFor(id: number): Promise<Buffer> {
    const ordonnance = await this.findOne(id);

    return this.pdfService.generateOrdonnancePDF({
      id: ordonnance.id,
      date: ordonnance.date,
      patient: {
        nom: ordonnance.patient.nom,
        prenom: ordonnance.patient.prenom,
        email: ordonnance.patient.email,
      },
      medecin: {
        nom: ordonnance.medecin.nom,
        prenom: ordonnance.medecin.prenom,
        specialite: ordonnance.medecin.specialite,
      },
      prescription: ordonnance.contenu,
    });
  }
}
