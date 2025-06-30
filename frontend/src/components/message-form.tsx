import { useState } from 'react'
import type { Patient } from '@/types/patient'

type MessageFormProps = {
  patient: Patient
  onSubmit: (data: { subject: string; message: string }) => Promise<void>
  onClose: () => void
}

export function MessageForm({ patient, onSubmit, onClose }: MessageFormProps) {
  const [formData, setFormData] = useState({ subject: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold">Contacter {patient.prenom} {patient.nom}</h2>
      <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Sujet" required />
      <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message..." rows={4} required />
      <div className="flex gap-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Envoyer</button>
        <button type="button" onClick={onClose} className="text-gray-600">Annuler</button>
      </div>
    </form>
  )
}
