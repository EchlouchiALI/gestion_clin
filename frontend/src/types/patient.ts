export type Patient = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  medecin?: {
    id: number
    nom: string
    prenom: string
  }
  ordonnances?: any[]
  rendezvous?: any[]
}

export type CreatePatientData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
}

export type UpdatePatientData = CreatePatientData & {
  id: number
}
