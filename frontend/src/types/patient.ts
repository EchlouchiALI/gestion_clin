// types/patient.ts

export type Patient = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  medecin?: {
    id: number
    nom: string
    prenom: string
  }
  ordonnances?: any[]
  rendezvous?: any[]
  // ✅ Ajout des champs médicaux
  maladiesConnues?: string
  traitementsEnCours?: string
  allergies?: string
  antecedentsMedicaux?: string
}

export type CreatePatientData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  password: string
  // ✅ Champs médicaux
  maladiesConnues?: string
  traitementsEnCours?: string
  allergies?: string
  antecedentsMedicaux?: string
}

export type UpdatePatientData = Omit<CreatePatientData, 'password'> & {
  id: number
}

export type PatientFormData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  password?: string // requis uniquement pour création
  // ✅ Champs médicaux
  maladiesConnues?: string
  traitementsEnCours?: string
  allergies?: string
  antecedentsMedicaux?: string
}
