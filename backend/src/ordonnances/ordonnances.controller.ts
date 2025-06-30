import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import bwipjs from 'bwip-js'
import { CreateOrdonnanceManuelDto } from './dto/create-ordonnance-manuel.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('medecin')
@Controller('medecin/ordonnances')
export class OrdonnancesController {
  @Post('pdf-manuel')
  async generatePdfManuel(
    @Body() dto: CreateOrdonnanceManuelDto,
    @Res() res: Response,
  ) {
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595, 842]) // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    const drawText = (text: string, x: number, y: number, size = 11, bold = false, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color,
      })
    }

    const blue = rgb(0.1, 0.2, 0.6)
    const startX = 50

    // 🧑‍⚕️ Médecin
    drawText(`Docteur ${dto.medecinNom}`, startX, 790, 13, true, blue)
    drawText(dto.medecinSpecialite ?? 'Médecine Générale', startX, 775, 11, false, blue)
    drawText(dto.medecinDiplome, startX, 760, 10, false, blue)

    // Adresse & téléphone
    drawText(dto.medecinAdresse, 400, 790, 10)
    drawText(`Tél cabinet : ${dto.medecinTelephoneCabinet}`, 400, 775, 10)
    drawText(`Tél urgences : ${dto.medecinTelephoneUrgence}`, 400, 760, 10)

    // 📦 Code-barres
    const barcodeText = `ORD-${Date.now()}`
    const barcodePng = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeText,
      scale: 2,
      height: 10,
      includetext: false,
    })
    const barcodeImage = await pdf.embedPng(barcodePng)
    page.drawImage(barcodeImage, {
      x: startX,
      y: 730,
      width: 200,
      height: 30,
    })

    // 📅 Date
    drawText(`Marseille, le ${dto.date}`, 400, 730, 11)

    // 👩‍⚕️ Patient
    drawText(dto.patientNom, startX, 700, 12)
    drawText(`${dto.patientAge} ans, ${dto.patientPoids} kg`, startX, 685, 11)

    // 💊 Médicaments
    let y = 660
    dto.medicaments.forEach((med) => {
      drawText(`MÉDICAMENT ${med.nom.toUpperCase()} : ${med.posologie}`, startX, y)
      if (med.mte) drawText('Non Substituable (MTE)', 400, y)
      if (med.ar) drawText(`AR ${med.ar}`, 400, y - 12)
      if (med.qsp) drawText(`QSP ${med.qsp}`, 400, y - 24)
      if (med.nr) drawText(`Non Remboursable (NR)`, 400, y - 36)
      y -= 60
    })

    // 📝 Conseils
    const conseils = dto.conseils.split('\n')
    drawText('Conseils :', startX, y)
    conseils.forEach((line, i) => {
      drawText(line, startX, y - 15 - i * 13)
    })
    y -= 30 + conseils.length * 13

    // ✍️ Signature
    drawText('Signature :', 400, y)
    page.drawRectangle({ x: 500, y: y - 10, width: 60, height: 40, borderColor: rgb(0, 0, 0), borderWidth: 1 })

    // Phrase en bas
    drawText("Membre d'une association de gestion agréée. Le règlement des honoraires par chèque est accepté", startX, 40, 9, false, blue)

    const pdfBytes = await pdf.save()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=ordonnance.pdf')
    res.send(Buffer.from(pdfBytes))
  }
}
