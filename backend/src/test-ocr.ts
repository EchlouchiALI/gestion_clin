const gm = require('gm').subClass({ imageMagick: false }); // GraphicsMagick
import * as path from 'path';

const pdfPath = path.join(__dirname, '../uploads/1752240944925-tester.pdf');
const outputPath = path.join(__dirname, '../uploads/page-1.png');

gm(pdfPath + '[0]') // la première page du PDF
  .density(150, 150)
  .resize(1024, 1024)
  .write(outputPath, (err: any) => {
    if (err) return console.error('❌ Erreur conversion PDF → image :', err);
    console.log('✅ Image générée :', outputPath);
  });
