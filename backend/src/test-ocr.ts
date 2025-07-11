import { extractTextWithOCR } from './utils/pdf-ocr';
import * as path from 'path';

async function testOCR() {
  const pdfPath = path.join(__dirname, '../uploads/ordonnance-test.pdf'); // mets ici ton vrai fichier
  try {
    const texte = await extractTextWithOCR(pdfPath);
    console.log('Texte extrait avec OCR :\n');
    console.log(texte || '[VIDE]');
  } catch (error) {
    console.error('Erreur OCR :', error);
  }
}

testOCR();
