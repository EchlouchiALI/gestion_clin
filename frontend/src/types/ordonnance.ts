export type Medicament = {
  nom: string
  posologie: string
  mte?: boolean
  ar?: string
  qsp?: string
  nr?: boolean
}

export type Ordonnance = {
  id: number
  date: string
  contenu: string
  traitements?: string        // ✅ Traitement médical
  duree?: string              // ✅ Durée du traitement
  analyses?: string           // ✅ Analyses à faire
  patient: {
    id: number
    nom: string
    prenom: string
    email?: string
  }
  medecin: {
    id: number
    nom: string
    prenom: string
    specialite?: string
  }
  medicaments: Medicament[]
}
