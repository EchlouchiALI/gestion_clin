import React, { useState } from 'react'
import type { Patient } from '@/types/patient'

type PatientFormProps = {
  patient?: Patient
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}

export default function PatientForm({ patient, onSubmit, onClose }: PatientFormProps) {
  const [formData, setFormData] = useState({
    nom: patient?.nom || '',
    prenom: patient?.prenom || '',
    email: patient?.email || '',
    telephone: patient?.telephone || '',
    sexe: patient?.sexe || '',
    dateNaissance: patient?.dateNaissance || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required />
      <input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" />
      <select name="sexe" value={formData.sexe} onChange={handleChange} required>
        <option value="">Sexe</option>
        <option value="homme">Homme</option>
        <option value="femme">Femme</option>
      </select>
      <input name="dateNaissance" type="date" value={formData.dateNaissance} onChange={handleChange} />
      <div className="flex gap-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enregistrer</button>
        <button type="button" onClick={onClose} className="text-gray-600">Annuler</button>
      </div>
    </form>
  )
}
