import { analyseOrdonnanceAvecFallbackOCR } from './ordonnances/ordonnances.service';

import * as fs from 'fs';
import * as path from 'path';

async function testAnalyse() {
  const filePath = path.resolve(__dirname, '../uploads/1752246774862-WhatsApp Image 2025-07-11 at 13.50.25_e60eff48.pdf.jpg');

  if (!fs.existsSync(filePath)) {
    console.error('❌ Fichier PDF introuvable :', filePath);
    return;
  }

  try {
    const result = await analyseOrdonnanceAvecFallbackOCR(filePath);
    console.log('✅ Résultat de l’analyse IA :\n', result);
  } catch (error) {
    console.error('❌ Erreur lors de l’analyse :', error);
  }
}

testAnalyse();
