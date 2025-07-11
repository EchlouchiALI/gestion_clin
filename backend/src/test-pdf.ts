import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testPDF() {
    const buffer = fs.readFileSync('./uploads/temp-ocr.pdf');
  const data = await pdfParse(buffer);
  console.log('Texte extrait du PDF :\n', data.text);
}

testPDF().catch(console.error);
