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
}

// ✅ Utilisé lors de la création d’un patient
export type CreatePatientData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  password: string
}

// ✅ Utilisé lors de la mise à jour (le mot de passe n'est pas modifié)
export type UpdatePatientData = Omit<CreatePatientData, 'password'> & {
  id: number
}

// ✅ Utilisé dans le formulaire de création ou modification
export type PatientFormData = {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  password?: string // requis uniquement pour création
}

