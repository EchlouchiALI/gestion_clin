'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'

type Patient = {
  id: number
  nom: string
  prenom: string
}

export default function RdvModal() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3001/medecin/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setPatients(data)
    }
    fetchPatients()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')

    const body = {
      patientId: selectedPatient,
      date: `${date}T${heure}`,
      motif,
    }

    const res = await fetch('http://localhost:3001/medecin/rendezvous', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rendezvous_${selectedPatient}.pdf`
      link.click()
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">Donner un rendez-vous</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donner un rendez-vous</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Patient</Label>
            <select
              className="w-full border rounded px-2 py-1"
              onChange={(e) => setSelectedPatient(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                Sélectionner un patient
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label>Heure</Label>
              <Input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Motif</Label>
            <Textarea value={motif} onChange={(e) => setMotif(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={loading || !selectedPatient || !date || !heure || !motif} onClick={handleSubmit}>
            {loading ? 'Création...' : 'Créer le rendez-vous'}
          </Button>
        </DialogFooter>
        {success && <p className="text-green-600 pt-2">📄 Rendez-vous créé et PDF téléchargé !</p>}
      </DialogContent>
    </Dialog>
  )
}
