import { createWorker } from 'tesseract.js';
import * as path from 'path';

async function runOCR() {
  const imagePath = path.join(__dirname, '../uploads/page-1.png');

  const worker = await createWorker();
  await worker.loadLanguage('fra');
  await worker.initialize('fra');

  const result = await worker.recognize(imagePath);
  await worker.terminate();

  console.log('🧾 Texte OCR extrait :\n', result.data.text);
}

runOCR().catch((err) => {
  console.error('❌ Erreur OCR :', err);
});
