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
    patient: { nom: string; prenom: string; email: string };
    medecin: { nom: string; prenom: string; specialite?: string };
    prescription: string;
    date: string;
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
      .fontSize(14)
      .fillColor('#475569')
      .text('Ordonnance médicale', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`N° Ordonnance : ${data.id}`)
      .text(`Date : ${data.date}`)
      .text(`Médecin : Dr. ${data.medecin.prenom} ${data.medecin.nom} (${data.medecin.specialite || 'Généraliste'})`)
      .text(`Patient : ${data.patient.prenom} ${data.patient.nom}`)
      .text(`Email patient : ${data.patient.email}`)
      .moveDown();

    doc
      .fontSize(12)
      .text('Prescription :', { underline: true })
      .moveDown(0.5)
      .font('Times-Roman')
      .fontSize(13)
      .text(data.prescription, { align: 'left' })
      .moveDown(2);

    doc
      .fontSize(10)
      .fillColor('gray')
      .text('Polyclinique Atlas - 123 rue Principale, Ville - Tél: 05 24 00 00 00', {
        align: 'center',
      });

    const barcode = await bwipjs.toBuffer({
      bcid: 'code128',
      text: `${data.id}`,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    doc.image(barcode, 220, doc.y + 10, { fit: [150, 50] });

    doc.end();

    return new Promise<Buffer>((resolve) => {
      writableStream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
  async generatePatientPDF(patient: any): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    const stream = new Writable({
      write(chunk, _enc, next) {
        chunks.push(chunk);
        next();
      },
    });
  
    doc.pipe(stream);
  
    doc.fontSize(20).text('Dossier Patient', { align: 'center' }).moveDown();
  
    doc.fontSize(12).text(`ID : ${patient.id}`);
    doc.text(`Nom : ${patient.nom}`);
    doc.text(`Prénom : ${patient.prenom}`);
    doc.text(`Email : ${patient.email}`);
    doc.text(`Téléphone : ${patient.telephone}`);
    doc.text(`Sexe : ${patient.sexe}`);
    doc.text(`Date de naissance : ${patient.dateNaissance}`);
  
    doc.end();
  
    return new Promise<Buffer>((resolve) => {
      stream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
  
}
