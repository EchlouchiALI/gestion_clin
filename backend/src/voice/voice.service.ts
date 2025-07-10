import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Medecin } from '../medecins/medecin.entity'

@Injectable()
export class VoiceService {
  constructor(
    @InjectRepository(Medecin)
    private readonly medecinRepo: Repository<Medecin>,
  ) {}

  async parseCommand(text: string) {
    const doctorMatch = text.match(/(?:docteur|dr)\s+([\w-]+)/i)
    const dateMatch = text.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i)
    const timeMatch = text.match(/(\d{1,2})\s*(?:h|heures?)/i)

    if (!doctorMatch || !dateMatch || !timeMatch) {
      return null
    }

    const nomMedecin = doctorMatch[1].toLowerCase()
    const medecin = await this.medecinRepo
      .createQueryBuilder('medecin')
      .where('LOWER(medecin.nom) LIKE :nom', { nom: `%${nomMedecin}%` })
      .getOne()

    const mois: Record<string, string> = {
      janvier: '01',
      février: '02',
      mars: '03',
      avril: '04',
      mai: '05',
      juin: '06',
      juillet: '07',
      août: '08',
      septembre: '09',
      octobre: '10',
      novembre: '11',
      décembre: '12',
    }

    const [jour, moisParle] = [dateMatch[1], dateMatch[2].toLowerCase()]
    const moisNum = mois[moisParle]
    const year = new Date().getFullYear()
    const date = moisNum ? `${year}-${moisNum}-${jour.padStart(2, '0')}` : undefined
    const heure = `${timeMatch[1].padStart(2, '0')}:00`

    return {
      medecinId: medecin?.id ?? null,
      date,
      heure,
    }
  }
}