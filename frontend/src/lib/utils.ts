import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

// ⚙️ Configuration du worker
GlobalWorkerOptions.workerSrc = workerSrc

export { getDocument }
