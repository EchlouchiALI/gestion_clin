import { Injectable, NotFoundException ,ForbiddenException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RendezVous } from './rendezvous.entity';
import { User } from '../users/user.entity';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';

@Injectable()
export class RendezvousService {
  constructor(
    @InjectRepository(RendezVous)
    private readonly rendezvousRepo: Repository<RendezVous>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) {}

  async findAllForAdmin() {
    return this.rendezvousRepo.find({
      relations: ['patient', 'medecin'],
      order: { date: 'DESC' },
    });
  }

  async findByPatient(patientId: number) {
    return this.rendezvousRepo.find({
      where: { patient: { id: patientId } },
      relations: ['medecin'],
      order: { date: 'ASC' },
    });
  }

  async findByMedecin(medecinId: number) {
    return this.rendezvousRepo.find({
      where: { medecin: { id: medecinId } },
      relations: ['patient', 'medecin'],
      order: { date: 'DESC' },
    });
  }

  async createByAdmin(data: {
    patientId: number;
    medecinId: number;
    date: string;
    heure: string;
    motif: string;
  }) {
    const { patientId, medecinId, date, heure, motif } = data;

    const patient = await this.userRepo.findOne({ where: { id: patientId } });
    const medecin = await this.userRepo.findOne({ where: { id: medecinId, role: 'medecin' } });

    if (!patient || !medecin) throw new NotFoundException('Patient ou médecin introuvable');

    const rdv = this.rendezvousRepo.create({
      date,
      heure,
      motif,
      statut: 'à venir',
      patient,
      medecin,
    });

    const saved = await this.rendezvousRepo.save(rdv);

    const pdfBuffer = await this.pdfService.generateRendezVousPDF({
      id: saved.id,
      nom: patient.nom,
      prenom: patient.prenom,
      email: patient.email,
      date: saved.date,
      heure: saved.heure,
      motif: saved.motif,
      medecin: `Dr. ${medecin.prenom} ${medecin.nom}`,
    });

    await this.mailService.sendMailWithAttachment({
      to: patient.email,
      subject: 'Confirmation de rendez-vous – Polyclinique Atlas',
      html: `
        <p>Bonjour ${patient.prenom},</p>
        <p>Votre rendez-vous a bien été enregistré :</p>
        <ul>
          <li><strong>Date :</strong> ${saved.date} à ${saved.heure}</li>
          <li><strong>Médecin :</strong> Dr. ${medecin.prenom} ${medecin.nom}</li>
        </ul>
        <p>Vous trouverez en pièce jointe votre fiche de rendez-vous (PDF).</p>
        <br/>
        <p style="font-size: 0.9rem; color: gray;">Polyclinique Atlas</p>
      `,
      buffer: pdfBuffer,
      filename: `rendezvous-${saved.id}.pdf`,
    });

    return saved;
  }

  async createByPatient(data: {
    patientId: number;
    medecinId: number;
    date: string;
    heure: string;
  }) {
    const { patientId, medecinId, date, heure } = data;

    const patient = await this.userRepo.findOne({ where: { id: patientId } });
    const medecin = await this.userRepo.findOne({ where: { id: medecinId, role: 'medecin' } });

    if (!patient || !medecin) throw new NotFoundException('Patient ou médecin introuvable');

    const rdv = this.rendezvousRepo.create({
      patient,
      medecin,
      date,
      heure,
      statut: 'à venir',
      motif: 'Consultation',
    });

    return await this.rendezvousRepo.save(rdv);
  }

  async delete(id: number, user?: any) {
    const rdv = await this.rendezvousRepo.findOne({
      where: { id },
      relations: ['patient'],
    });
  
    if (!rdv) throw new NotFoundException("Rendez-vous introuvable");
  
    // Si user est passé (ex: patient connecté), on vérifie que c’est bien lui
    if (user && user.role === 'patient' && rdv.patient.id !== user.id) {
      throw new ForbiddenException("Non autorisé à supprimer ce rendez-vous");
    }
  
    await this.rendezvousRepo.delete(id);
    return { message: 'Rendez-vous supprimé' };
  }
  

  async generatePdfFor(id: number): Promise<Buffer> {
    const rdv = await this.rendezvousRepo.findOne({
      where: { id },
      relations: ['patient', 'medecin'],
    });

    if (!rdv) throw new NotFoundException('Rendez-vous non trouvé');

    return this.pdfService.generateRendezVousPDF({
      id: rdv.id,
      nom: rdv.patient.nom,
      prenom: rdv.patient.prenom,
      email: rdv.patient.email,
      date: rdv.date,
      heure: rdv.heure,
      motif: rdv.motif,
      medecin: `Dr. ${rdv.medecin.prenom} ${rdv.medecin.nom}`,
    });
  }

  async update(id: number, data: {
    medecinId?: number;
    date?: string;
    heure?: string;
    motif?: string;
    statut?: string;
  }, user?: any) {
    const rdv = await this.rendezvousRepo.findOne({
      where: { id },
      relations: ['patient', 'medecin'],
    });
  
    if (!rdv) throw new NotFoundException('Rendez-vous introuvable');
  
    // 🛡 Vérification d'autorisation si c’est un patient
    if (user && user.role === 'patient' && rdv.patient.id !== user.id) {
      throw new ForbiddenException("Non autorisé à modifier ce rendez-vous");
    }
  
    // ✅ Mises à jour
    if (data.medecinId) {
      const medecin = await this.userRepo.findOne({
        where: { id: data.medecinId, role: 'medecin' },
      });
      if (!medecin) throw new NotFoundException('Médecin introuvable');
      rdv.medecin = medecin;
    }
  
    if (data.date) rdv.date = data.date;
    if (data.heure) rdv.heure = data.heure;
    if (data.motif) rdv.motif = data.motif;
  
    if (data.statut) {
      const validStatuts = ['à venir', 'passé', 'annulé'];
      if (!validStatuts.includes(data.statut)) {
        throw new Error('Statut invalide');
      }
      rdv.statut = data.statut as 'à venir' | 'passé' | 'annulé';
    }
  
    return await this.rendezvousRepo.save(rdv);
  }
  
  
  

  async markPastAppointments() {
    const now = moment();
    const futurs = await this.rendezvousRepo.find({ where: { statut: 'à venir' } });

    const toUpdate = futurs.filter((rdv) => {
      const datetime = moment(`${rdv.date} ${rdv.heure}`, 'YYYY-MM-DD HH:mm');
      return datetime.isBefore(now);
    });

    for (const rdv of toUpdate) {
      rdv.statut = 'passé';
      await this.rendezvousRepo.save(rdv);
    }

    return { updated: toUpdate.length };
  }

  @Cron('*/1 * * * *')
  handleCronUpdate() {
    this.markPastAppointments();
  }

  async updateStatut(id: number, statut: string, notes: string | undefined, medecinId: number) {
    const rdv = await this.rendezvousRepo.findOne({
      where: { id, medecin: { id: medecinId } },
      relations: ['medecin'],
    });
  
    if (!rdv) throw new NotFoundException('Rendez-vous introuvable pour ce médecin.');
  
    // ✅ Vérification du statut
    if (!['à venir', 'passé', 'annulé'].includes(statut)) {
      throw new Error('Statut invalide');
    }
  
    rdv.statut = statut as 'à venir' | 'passé' | 'annulé';
  
    if (notes !== undefined) rdv.notes = notes;
  
    return await this.rendezvousRepo.save(rdv);
  }
  
  
  
}
