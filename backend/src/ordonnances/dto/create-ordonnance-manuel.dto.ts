export class CreateOrdonnanceManuelDto {
    medecinNom: string
    medecinSpecialite: string
    medecinDiplome: string
    medecinAdresse: string
    medecinTelephoneCabinet: string
    medecinTelephoneUrgence: string
  
    patientNom: string
    patientAge: string
    patientPoids: string
    date: string
    conseils: string
  
    medicaments: {
      nom: string
      posologie: string
      mte?: boolean
      ar?: string
      qsp?: string
      nr?: boolean
    }[]
  }
  