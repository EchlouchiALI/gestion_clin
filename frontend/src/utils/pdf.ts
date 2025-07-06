import * as pdfjsLib from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Définir le chemin du worker
pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

export { pdfjsLib };
