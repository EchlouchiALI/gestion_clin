import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Ordonnance } from '@/types/ordonnance'

interface Props {
  ordonnance: Ordonnance | null
  onClose: () => void
}

interface Patient {
  id: number
  nom: string
  prenom: string
}

export default function OrdonnanceForm({ ordonnance, onClose }: Props) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState<number | null>(ordonnance?.patient?.id || null)
  const [contenu, setContenu] = useState(ordonnance?.contenu || '')

  useEffect(() => {
    fetch('http://localhost:3001/medecin/patients', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error('Erreur chargement patients', err))
  }, [])

  const handleSubmit = async () => {
    const payload = {
      contenu,
      patient: { id: patientId },
    }

    const method = ordonnance ? 'PUT' : 'POST'
    const url = ordonnance
      ? `http://localhost:3001/medecin/ordonnances/${ordonnance.id}`
      : `http://localhost:3001/medecin/ordonnances`

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      alert('✅ Ordonnance enregistrée')
      onClose()
    } catch (err) {
      console.error(err)
      alert('❌ Une erreur est survenue')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ordonnance ? '✏️ Modifier' : '➕ Nouvelle'} Ordonnance</DialogTitle>
        </DialogHeader>

        <label className="block mb-2 font-semibold">👨‍⚕️ Patient</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={patientId || ''}
          onChange={(e) => setPatientId(Number(e.target.value))}
        >
          <option value='' disabled>Choisir un patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} {p.prenom}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">📝 Contenu</label>
        <Textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Exemple : Doliprane 3x/jour, antibiotiques..."
          className="mb-4"
        />

        <Button onClick={handleSubmit} disabled={!patientId || !contenu}>
          💾 Enregistrer
        </Button>
      </DialogContent>
    </Dialog>
  )
}