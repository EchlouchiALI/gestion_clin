import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit'; // ✅ Bon import

import * as qrcode from 'qrcode';
import { Writable } from 'stream';

@Injectable()
export class PdfService {
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

    const chunks: any[] = [];
    const writableStream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    doc.pipe(writableStream);

    // ✅ En-tête
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

    // ✅ Bloc infos encadré
    const boxY = doc.y;
    const boxHeight = 160;
    doc
      .roundedRect(40, boxY, 520, boxHeight, 8)
      .fillAndStroke('#f8fafc', '#cbd5e1');

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`N°: ${data.id}`, 60, boxY + 10)
      .text(`Nom: ${data.nom} ${data.prenom}`)
      .text(`Email: ${data.email}`)
      .text(`Date & Heure: ${data.date} à ${data.heure}`)
      .text(`Motif: ${data.motif}`)
      .text(`Médecin: ${data.medecin}`);

    // ✅ QR Code
    const qrText = `RDV #${data.id}\nNom: ${data.nom} ${data.prenom}\nDate: ${data.date} à ${data.heure}\nMédecin: ${data.medecin}`;
    const qrImage = await qrcode.toDataURL(qrText);
    doc.image(qrImage, 400, boxY + 10, { fit: [100, 100] });

    doc.moveDown(6);

    // ✅ Footer
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(
        'Merci de vous présenter 15 minutes à l’avance avec votre carte d’identité.',
        50,
        700,
        { align: 'center' }
      );

    doc.end();

    return new Promise<Buffer>((resolve) => {
      writableStream.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}
