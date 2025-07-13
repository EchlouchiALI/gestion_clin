import * as fs from 'fs';
import * as path from 'path';
import * as Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import * as pdf2pic from 'pdf-poppler';
import { analyseOrdonnanceAvecFallbackOCR } from './ordonnances/ordonnances.service';

async function isPDF(filePath: string): Promise<boolean> {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('utf8', 0, 4) === '%PDF';
}

async function extractTextFromImages(pdfPath: string): Promise<string> {
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
      logger: m => console.log(`🔍 OCR: ${m.status} (${Math.round((m.progress || 0) * 100)}%)`),
    });
    fullText += result.data.text + '\n';
  }

  return fullText.trim();
}

async function extractTextFromPDF(pdfPath: string): Promise<string> {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  return data.text.trim();
}

async function analyseFichier(filePath: string) {
  const absolutePath = path.resolve(filePath);
  let texte = '';

  if (await isPDF(absolutePath)) {
    console.log('📄 Fichier PDF détecté');
    try {
      texte = await extractTextFromPDF(absolutePath);
      if (!texte || texte.length < 30) throw new Error('PDF vide ou trop court');
    } catch {
      console.warn('⚠️ PDF illisible, fallback OCR');
      texte = await extractTextFromImages(absolutePath);
    }
  } else {
    console.log('🖼️ Image détectée');
    texte = await Tesseract.recognize(absolutePath, 'fra', {
      logger: m => console.log(`🧠 OCR: ${m.status} (${Math.round((m.progress || 0) * 100)}%)`),
    }).then(res => res.data.text.trim());
  }

  if (!texte || texte.length < 10) {
    throw new Error('❌ Le texte extrait est vide ou insuffisant');
  }

  console.log('🧾 Texte extrait :\n', texte);

  const resultat = await analyseOrdonnanceAvecFallbackOCR(absolutePath);
  console.log('🤖 Résultat IA :\n', resultat);
}

// Remplace le nom du fichier ici par le chemin réel :
analyseFichier('./uploads/1.pdf')
  .catch((err) => console.error('❌ Erreur :', err.message));
