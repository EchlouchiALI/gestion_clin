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
  
    // En-tête
    doc
      .fontSize(20)
      .text(`Dr ${data.medecin.prenom} ${data.medecin.nom}`, { align: 'left' })
      .fontSize(12)
      .text(`${data.medecin.specialite || 'Médecin généraliste'}`, { align: 'left' })
      .text('Polyclinique Atlas')
      .text('123 rue Principale, Ville')
      .text('Tél: 05 24 00 00 00')
      .moveDown();
  
    // Infos patient
    doc
      .fontSize(12)
      .text(`Date : ${data.date}`, { align: 'right' })
      .moveDown()
      .text(`Patient : ${data.patient.prenom} ${data.patient.nom}`)
      .text(`Email : ${data.patient.email}`)
      .moveDown();
  
    // Prescription
    doc
      .fontSize(14)
      .text('Ordonnance médicale', { underline: true })
      .moveDown()
      .fontSize(12)
      .text(data.prescription, {
        align: 'left',
        lineGap: 6,
      })
      .moveDown(2);
  
    // Pied + Code-barres
    const barcode = await bwipjs.toBuffer({
      bcid: 'code128',
      text: `${data.id}`,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
  
    doc.image(barcode, doc.page.width / 2 - 75, doc.y, {
      fit: [150, 40],
      align: 'center',
    });
  
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

    // En-tête
    doc
      .fontSize(26)
      .fillColor('#004080')
      .font('Helvetica-Bold')
      .text('CLINIQUE ATLAS', { align: 'center' })
      .moveDown();

    doc
      .fontSize(18)
      .fillColor('black')
      .font('Helvetica')
      .text('Dossier Patient', { align: 'center' })
      .moveDown(1.5);

    // Infos patient
    doc
      .roundedRect(40, doc.y, 520, 200, 8)
      .stroke('#cccccc')
      .moveDown();

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('black')
      .text(`ID : ${patient.id}`, 60, doc.y + 10)
      .text(`Nom : ${patient.nom}`)
      .text(`Prénom : ${patient.prenom}`)
      .text(`Email : ${patient.email}`)
      .text(`Téléphone : ${patient.telephone}`)
      .text(`Sexe : ${patient.sexe}`)
      .text(`Date de naissance : ${patient.dateNaissance}`)
      .moveDown();

    // Pied
    doc
      .moveDown(2)
      .fontSize(10)
      .fillColor('gray')
      .text(`Document généré le : ${new Date().toLocaleDateString()}`, { align: 'right' });

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
