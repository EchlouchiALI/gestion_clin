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
import { OrdonnanceAnalyse } from '../ordonnance-analyse/ordonnance-analyse.entity';
import { UpdateOrdonnanceDto } from './dto/update-ordonnance.dto';
import { extractTextWithOCR } from '../utils/pdf-ocr';
import { envoyerVersIA } from '../utils/openai';
import * as fs from 'fs';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import * as pdf2pic from 'pdf-poppler';
import pdfParse from 'pdf-parse';

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
    if (!ordonnance) throw new NotFoundException('Ordonnance non trouvée');
    return ordonnance;
  }

  async createWithPdfAndMail(medecinId: number, dto: CreateOrdonnanceDto): Promise<Ordonnance> {
    const patient = await this.userRepo.findOne({ where: { id: dto.patientId } });
    const medecin = await this.medecinRepo.findOne({ where: { id: medecinId } });
    if (!patient || !medecin) throw new NotFoundException('Patient ou médecin introuvable');
  
    const ordonnance = this.ordonnanceRepository.create({
      contenu: dto.contenu,
      traitements: dto.traitements,  // ajout ici
      duree: dto.duree,              // ajout ici
      analyses: dto.analyses,        // ajout ici
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
      traitements: saved.traitements,  // penser à transmettre au PDF
      duree: saved.duree,
      analyses: saved.analyses,
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
    if (!found) throw new NotFoundException('Ordonnance non trouvée');
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
      traitements: ordonnance.traitements,      // ✅ ajouté
      duree: ordonnance.duree,                  // ✅ ajouté
      analyses: ordonnance.analyses,            // ✅ ajouté
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

  async updateOrdonnance(
    id: number,
    medecinId: number,
    dto: UpdateOrdonnanceDto,
  ): Promise<Ordonnance> {
    const ordonnance = await this.ordonnanceRepository.findOne({
      where: { id },
      relations: ['medecin', 'patient'],
    });
  
    if (!ordonnance) throw new NotFoundException('Ordonnance non trouvée');
    if (ordonnance.medecin.id !== medecinId)
      throw new UnauthorizedException("Vous ne pouvez modifier que vos propres ordonnances");
  
    if (dto.contenu !== undefined) ordonnance.contenu = dto.contenu;
    if (dto.patientId && ordonnance.patient.id !== dto.patientId) {
      const newPatient = await this.userRepo.findOne({ where: { id: dto.patientId } });
      if (!newPatient) throw new NotFoundException("Nouveau patient introuvable");
      ordonnance.patient = newPatient;
    }
    if (dto.traitements !== undefined) ordonnance.traitements = dto.traitements;
    if (dto.duree !== undefined) ordonnance.duree = dto.duree;
    if (dto.analyses !== undefined) ordonnance.analyses = dto.analyses;
  
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
      traitements: ordonnance.traitements,   // 🔥 ajoute ceci
      duree: ordonnance.duree,               // 🔥 ajoute ceci
      analyses: ordonnance.analyses,
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

  async analyseFichierUpload(fileBuffer: Buffer, originalName: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();
    let texte = '';

    if (ext === '.pdf') {
      try {
        const data = await pdfParse(fileBuffer);
        texte = data.text?.trim() || '';
      } catch (err) {
        console.error('Erreur PDF-Parse:', err);
      }

      if (!texte) {
        const tempPath = 'uploads/temp-ocr.pdf';
        fs.writeFileSync(tempPath, fileBuffer);
        texte = await extractTextWithOCR(tempPath);
        fs.unlinkSync(tempPath);
      }
    } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const tempPath = 'uploads/temp-image' + ext;
      fs.writeFileSync(tempPath, fileBuffer);

      const result = await Tesseract.recognize(tempPath, 'fra', {
        logger: (m) => console.log(`🧠 OCR: ${m.status} ${Math.round(m.progress * 100)}%`),
      });

      texte = result.data.text.trim();
      fs.unlinkSync(tempPath);
    } else {
      throw new Error('Format de fichier non pris en charge.');
    }

    if (!texte) throw new Error('Le fichier est vide ou illisible.');

    return envoyerVersIA(texte);
  }

  async getAllAnalyses() {
    return this.ordonnanceAnalyseRepository.find({
      order: { date: 'DESC' },
    });
  }

  async deleteAnalyse(id: number) {
    const analyse = await this.ordonnanceAnalyseRepository.findOne({ where: { id } });
    if (!analyse) throw new NotFoundException("Analyse introuvable");

    await this.ordonnanceAnalyseRepository.remove(analyse);
    return { message: 'Analyse supprimée avec succès' };
  }
}
// 🔄 Fonction exportée pour test externe
export async function analyseOrdonnanceAvecFallbackOCR(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const textePdf = data.text?.trim();

    if (textePdf && textePdf.length > 30) {
      console.log('📄 Texte extrait via pdf-parse :\n', textePdf);
      return envoyerVersIA(textePdf);
    } else {
      console.warn('⚠️ Texte vide via pdf-parse, fallback OCR activé');
    }
  } catch (err) {
    console.error('❌ Erreur lecture PDF :', err);
  }

  try {
    const outputDir = './uploads';
    const images = await pdf2pic.convert(pdfPath, {
      format: 'png',
      out_dir: outputDir,
      out_prefix: 'page',
      page: null,
    });

    let fullText = '';
    for (const image of images) {
      const result = await Tesseract.recognize(image.path, 'fra', {
        logger: m => console.log(`🔍 OCR: ${m.status} (${Math.round(m.progress * 100)}%)`),
      });
      fullText += result.data.text + '\n';
    }

    const cleanText = fullText.trim();
    console.log('🧾 Texte OCR extrait :\n', cleanText);

    return envoyerVersIA(cleanText);
  } catch (err) {
    console.error('❌ Erreur OCR :', err);
    throw new Error('Échec de l’analyse OCR');
  }
}
