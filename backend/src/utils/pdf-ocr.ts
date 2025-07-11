import { fromPath } from 'pdf2pic';
import { createWorker } from 'tesseract.js';
import * as path from 'path';
import * as fs from 'fs';

export async function extractTextWithOCR(pdfPath: string): Promise<string> {
  const imagePath = path.join('uploads', 'page-1.png');

  // 1. Convertir PDF page 1 en image PNG
  const converter = fromPath(pdfPath, {
    density: 150, // qualité
    saveFilename: 'page-1',
    savePath: 'uploads',
    format: 'png',
    width: 1024,
    height: 1024,
  });

  await converter(1); // Convertir la 1ère page

  // 2. OCR avec tesseract.js
  const worker = await createWorker(); // ✅ aucun argument ici

  const result = await worker.recognize(imagePath);
  await worker.terminate();

  // 3. Nettoyage image temporaire
  fs.unlinkSync(imagePath);

  return result.data.text;
}
