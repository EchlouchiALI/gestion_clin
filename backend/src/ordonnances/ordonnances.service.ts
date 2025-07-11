import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ordonnance } from './ordonnance.entity';
import { PdfService } from '../pdf/pdf.service';
import { User } from '../users/user.entity';
import { Medecin } from '../medecins/medecin.entity';
import { MailService } from '../mail/mail.service';
import { CreateOrdonnanceDto } from './dto/create-ordonnance.dto';
import { Activity } from '../activity/activity.entity';
import pdfParse from 'pdf-parse';
import { extractTextWithOCR } from '../utils/pdf-ocr'; 
import * as fs from 'fs';





import { OrdonnanceAnalyse } from '../ordonnance-analyse/ordonnance-analyse.entity';
import axios from 'axios';

@Injectable()
export class OrdonnancesService {
  constructor(
    @InjectRepository(Ordonnance)
    private readonly ordonnanceRepository: Repository<Ordonnance>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,

    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,

    @InjectRepository(OrdonnanceAnalyse)
private readonly ordonnanceAnalyseRepository: Repository<OrdonnanceAnalyse>,



    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) {}

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

  async createWithPdfAndMail(medecinId: number, dto: CreateOrdonnanceDto): Promise<Ordonnance> {
    const patient = await this.userRepo.findOne({ where: { id: dto.patientId } });
    const medecin = await this.medecinRepo.findOne({ where: { id: medecinId } });
    if (!patient || !medecin) {
      throw new NotFoundException('Patient ou médecin introuvable');
    }
    const ordonnance = this.ordonnanceRepository.create({
      contenu: dto.contenu,
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
    await this.activityRepo.save({
      type: 'Ordonnance créée',
      description: `${patient.prenom} ${patient.nom}`,
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

  async findByIdWithDetails(id: number) {
    return this.ordonnanceRepository.findOne({
      where: { id },
      relations: ['medecin', 'patient'],
    });
  }

  async generateCustomPdf(data: {
    nom: string;
    age: string;
    poids: string;
    medicaments: string;
    recommandations: string;
  }): Promise<Buffer> {
    return this.pdfService.generateOrdonnancePDFCustom(data);
  }

  async findByMedecin(medecinId: number): Promise<Ordonnance[]> {
    return this.ordonnanceRepository.find({
      where: { medecin: { id: medecinId } },
      relations: ['patient', 'medecin'],
      order: { date: 'DESC' },
    });
  }

  async updateOrdonnance(id: number, medecinId: number, dto: CreateOrdonnanceDto): Promise<Ordonnance> {
    const ordonnance = await this.ordonnanceRepository.findOne({
      where: { id },
      relations: ['medecin', 'patient'],
    });
    if (!ordonnance) throw new NotFoundException('Ordonnance non trouvée');
    if (ordonnance.medecin.id !== medecinId) {
      throw new UnauthorizedException("Vous ne pouvez modifier que vos propres ordonnances");
    }
    ordonnance.contenu = dto.contenu;
    if (dto.patientId && ordonnance.patient.id !== dto.patientId) {
      const newPatient = await this.userRepo.findOne({ where: { id: dto.patientId } });
      if (!newPatient) throw new NotFoundException("Nouveau patient introuvable");
      ordonnance.patient = newPatient;
    }
    await this.ordonnanceRepository.save(ordonnance);
    return ordonnance;
  }

  async sendOrdonnanceByEmail(id: number) {
    const ordonnance = await this.findOne(id);
    const pdfBuffer = await this.pdfService.generateOrdonnancePDF({
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
    await this.mailService.sendMailWithAttachment({
      to: ordonnance.patient.email,
      subject: 'Votre ordonnance – Polyclinique Atlas',
      html: `
        <p>Bonjour ${ordonnance.patient.prenom},</p>
        <p>Voici votre ordonnance transmise par votre médecin.</p>
        <p>Vous la trouverez en pièce jointe (PDF).</p>
        <br/>
        <p style="font-size: 0.9rem; color: gray;">Polyclinique Atlas</p>
      `,
      buffer: pdfBuffer,
      filename: `ordonnance-${ordonnance.id}.pdf`,
    });
  }

  async analyseOrdonnance(fileBuffer: Buffer): Promise<string> {
    let texte = '';
  
    try {
      const data = await pdfParse(fileBuffer);
      texte = data.text.trim();
    } catch (error) {
      console.error('Erreur pdf-parse, fallback OCR :', error);
    }
  
    if (!texte) {
      console.warn('Texte vide, tentative OCR...');
      const tempPath = 'uploads/temp-ocr.pdf';
      fs.writeFileSync(tempPath, fileBuffer);
      texte = await extractTextWithOCR(tempPath);
      fs.unlinkSync(tempPath);
    }
  
    if (!texte) throw new Error('Le PDF est vide ou illisible.');
  
    const prompt = `Voici une ordonnance médicale :\n\n"${texte}"\n\nExplique les médicaments, posologies et conseils pour un patient.`;
  
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mixtral-8x7b',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer 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`, // remplace par ta clé
          'Content-Type': 'application/json',
        },
      },
    );
  
    const analyseText = response.data.choices[0].message.content;
  
    await this.ordonnanceAnalyseRepository.save({
      texteOriginal: texte,
      texteAnalyse: analyseText,
    });
  
    return analyseText;
  }
  
  
  
  
  async getAllAnalyses() {
    return this.ordonnanceAnalyseRepository.find({
      order: { date: 'DESC' },
    });
  }
  
  async deleteAnalyse(id: number) {
    const analyse = await this.ordonnanceAnalyseRepository.findOne({ where: { id } });
    if (!analyse) {
      throw new NotFoundException("Analyse introuvable");
    }
  
    await this.ordonnanceAnalyseRepository.remove(analyse);
    return { message: 'Analyse supprimée avec succès' };
  }
}  