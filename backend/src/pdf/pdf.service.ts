import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as qrcode from 'qrcode';
import * as bwipjs from 'bwip-js';
import { Writable } from 'stream';

@Injectable()
export class PdfService {
  // ✅ PDF de Rendez-vous avec QR Code
  async generateRendezVousPDF(data: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    date: string;
    heure: string;
    motif: string;
    medecin: string;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    const writableStream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    doc.pipe(writableStream);

    doc
      .fillColor('#0f172a')
      .fontSize(24)
      .text('Polyclinique Atlas', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(16)
      .fillColor('#1e293b')
      .text('Confirmation de Rendez-vous', { align: 'center' })
      .moveDown(1.5);

    const boxY = doc.y;
    const boxHeight = 160;
    doc.roundedRect(40, boxY, 520, boxHeight, 8).fillAndStroke('#f8fafc', '#cbd5e1');

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`N°: ${data.id}`, 60, boxY + 10)
      .text(`Nom: ${data.nom} ${data.prenom}`)
      .text(`Email: ${data.email}`)
      .text(`Date & Heure: ${data.date} à ${data.heure}`)
      .text(`Motif: ${data.motif}`)
      .text(`Médecin: ${data.medecin}`);

    const qrText = `RDV #${data.id}\nNom: ${data.nom} ${data.prenom}\nDate: ${data.date} à ${data.heure}\nMédecin: ${data.medecin}`;
    const qrImage = await qrcode.toDataURL(qrText);
    doc.image(qrImage, 400, boxY + 10, { fit: [100, 100] });

    doc
      .moveDown(6)
      .fontSize(10)
      .fillColor('gray')
      .text(
        'Merci de vous présenter 15 minutes à l’avance avec votre carte d’identité.',
        50,
        700,
        { align: 'center' },
      );

    doc.end();

    return new Promise<Buffer>((resolve) => {
      writableStream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  // ✅ PDF d’Ordonnance avec Code-Barres
  async generateOrdonnancePDF(data: {
    id: number;
    date: string;
    patient: { nom: string; prenom: string; email: string };
    medecin: { nom: string; prenom: string; specialite?: string };
    prescription: string;
    traitements?: string;
    duree?: string;
    analyses?: string;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
  
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        buffers.push(chunk);
        callback();
      },
    });
  
    doc.pipe(stream);
  
    // 🧾 En-tête clinique
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Polyclinique Atlas', { align: 'center' })
      .moveDown(0.5);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('123 Route Sefrou, Fès - Maroc', { align: 'center' })
      .text('Tél : 05 24 11 26 28 | Email : contact@atlas.ma', { align: 'center' })
      .moveDown(2);
  
    // 📌 Titre
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('ORDONNANCE MÉDICALE', { align: 'center', underline: true })
      .moveDown(2);
  
    // 👨‍⚕️ Médecin
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Médecin : Dr ${data.medecin.prenom} ${data.medecin.nom}`)
      .text(`Spécialité : ${data.medecin.specialite || 'Médecin généraliste'}`)
      .moveDown(1);
  
    // 👤 Patient + date
    doc
      .text(`Patient : ${data.patient.prenom} ${data.patient.nom}`)
      .text(`Email : ${data.patient.email}`)
      .text(`Date : ${new Date(data.date).toLocaleDateString('fr-FR')}`)
      .moveDown(2);
  
    // 🩺 Sections médicales
    const writeSection = (title: string, content?: string) => {
      if (content && content.trim() !== '') {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(`${title} :`)
          .fontSize(11)
          .font('Helvetica')
          .text(content.trim())
          .moveDown(1);
      }
    };
  
    writeSection('Prescription', data.prescription);
    writeSection('Traitements', data.traitements);
    writeSection('Durée', data.duree);
    writeSection('Analyses', data.analyses);
  
    // ✍️ Signature
    doc
      .moveDown(3)
      .fontSize(11)
      .text('Signature du médecin :', { align: 'right' })
      .moveDown(2);
  
    // 📅 Pied de page
    doc
      .fontSize(9)
      .fillColor('gray')
      .text(
        `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        50,
        doc.page.height - 70,
        { align: 'center' }
      );
  
    // 🔢 Code-barres
    const barcode = await bwipjs.toBuffer({
      bcid: 'code128',
      text: String(data.id),
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
  
    const barcodeWidth = 150;
    const barcodeHeight = 40;
    const x = (doc.page.width - barcodeWidth) / 2;
    const y = doc.page.height - barcodeHeight - 40;
  
    doc.image(barcode, x, y, { width: barcodeWidth, height: barcodeHeight });
  
    doc.end();
  
    return new Promise((resolve) => {
      stream.on('finish', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }
  
  
  // ✅ PDF de Dossier Patient stylé
  async generatePatientPDF(patient: any): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
  
    const stream = new Writable({
      write(chunk, _enc, next) {
        chunks.push(chunk);
        next();
      },
    });
  
    doc.pipe(stream);
  
    // 🟦 En-tête
    doc
      .fillColor('#1F4E79')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('CLINIQUE ATLAS', { align: 'center' })
      .moveDown(0.3);
  
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(16)
      .text('Dossier Patient', { align: 'center' })
      .moveDown(1);
  
    // 🧍 Informations personnelles
    const y1 = doc.y;
    doc
      .roundedRect(40, y1, 520, 190, 8)
      .fillOpacity(0.05)
      .fillAndStroke('#E6F0FA', '#CCCCCC')
      .fillOpacity(1);
  
    doc
      .fillColor('#1F4E79')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Informations personnelles', 50, y1 + 10);
  
    doc
      .moveDown(1)
      .font('Helvetica')
      .fontSize(12)
      .fillColor('black')
      .text(`ID : ${patient.id}`)
      .text(`Nom : ${patient.nom}`)
      .text(`Prénom : ${patient.prenom}`)
      .text(`Email : ${patient.email}`)
      .text(`Téléphone : ${patient.telephone}`)
      .text(`Sexe : ${patient.sexe}`)
      .text(`Date de naissance : ${patient.dateNaissance}`)
      .text(`Lieu de naissance : ${patient.lieuNaissance || '—'}`)
      .moveDown(2);
  
    // 🩺 Informations médicales
    const y2 = doc.y;
    doc
      .roundedRect(40, y2, 520, 150, 8)
      .fillOpacity(0.05)
      .fillAndStroke('#FFF8E6', '#CCCCCC')
      .fillOpacity(1);
  
    doc
      .fillColor('#D17B00')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Informations médicales', 50, y2 + 10);
  
    doc
      .moveDown(1)
      .font('Helvetica')
      .fontSize(12)
      .fillColor('black')
      .text(`Maladies connues : ${patient.maladiesConnues || '—'}`)
      .text(`Traitements en cours : ${patient.traitementsEnCours || '—'}`)
      .text(`Allergies : ${patient.allergies || '—'}`)
      .text(`Antécédents médicaux : ${patient.antecedentsMedicaux || '—'}`)
      .moveDown(2);
  
    // 📅 Pied de page
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(`Document généré le : ${new Date().toLocaleDateString()}`, {
        align: 'right',
      });
  
    doc.end();
  
    return new Promise<Buffer>((resolve) => {
      stream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
  
  
  async generateOrdonnancePDFCustom(data: {
    nom: string;
    age: string;
    poids: string;
    medicaments: string;
    recommandations: string;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
  
    const stream = new Writable({
      write(chunk, _enc, next) {
        chunks.push(chunk);
        next();
      },
    });
  
    doc.pipe(stream);
  
    // En-tête
    doc.fontSize(20).text('ORDONNANCE MÉDICALE', { align: 'center' }).moveDown();
  
    doc.fontSize(12).text(`Nom du patient : ${data.nom}`);
    doc.text(`Âge : ${data.age}`);
    doc.text(`Poids : ${data.poids}`).moveDown();
  
    doc.fontSize(12).text('Médicaments prescrits :', { underline: true });
    doc.text(data.medicaments).moveDown();
  
    doc.fontSize(12).text('Recommandations :', { underline: true });
    doc.text(data.recommandations).moveDown(2);
  
    doc.fontSize(10).fillColor('gray').text('Polyclinique Atlas - Document généré automatiquement.', {
      align: 'center',
    });
  
    doc.end();
  
    return new Promise((resolve) => {
      stream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
  
}
