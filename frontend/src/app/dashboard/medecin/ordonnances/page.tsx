'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

// Nouveau type avec tous les champs demandés pour chaque médicament
type Medicament = {
  nom: string
  posologie: string
  mte?: boolean
  ar?: string
  qsp?: string
  nr?: boolean
}

export default function PageOrdonnanceManuelle() {
  const [form, setForm] = useState({
    medecinNom: '',
    medecinSpecialite: '',
    medecinAdresse: '',
    medecinDiplome: '',
    medecinTelephoneCabinet: '',
    medecinTelephoneUrgence: '',
    patientNom: '',
    patientAge: '',
    patientPoids: '',
    date: '',
    conseils: '',
  })

  const [medicaments, setMedicaments] = useState<Medicament[]>([])
  const [newMedicament, setNewMedicament] = useState<Medicament>({
    nom: '',
    posologie: '',
    mte: false,
    ar: '',
    qsp: '',
    nr: false,
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMedicament = () => {
    if (newMedicament.nom.trim() === '') return
    setMedicaments((prev) => [...prev, newMedicament])
    setNewMedicament({ nom: '', posologie: '', mte: false, ar: '', qsp: '', nr: false })
  }

  const handleRemoveMedicament = (index: number) => {
    setMedicaments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGeneratePDF = async () => {
    const payload = {
      ...form,
      medicaments,
    }

    const res = await fetch('http://localhost:3001/medecin/ordonnances/pdf-manuel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    })

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Créer une ordonnance manuellement</h1>

      {/* Médecin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="medecinNom" value={form.medecinNom} onChange={handleFormChange} placeholder="Nom du médecin" />
        <Input name="medecinSpecialite" value={form.medecinSpecialite} onChange={handleFormChange} placeholder="Spécialité" />
        <Input name="medecinDiplome" value={form.medecinDiplome} onChange={handleFormChange} placeholder="Diplôme" />
        <Input name="medecinAdresse" value={form.medecinAdresse} onChange={handleFormChange} placeholder="Adresse" />
        <Input name="medecinTelephoneCabinet" value={form.medecinTelephoneCabinet} onChange={handleFormChange} placeholder="Tél cabinet" />
        <Input name="medecinTelephoneUrgence" value={form.medecinTelephoneUrgence} onChange={handleFormChange} placeholder="Tél urgences" />
      </div>

      {/* Patient */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input name="patientNom" value={form.patientNom} onChange={handleFormChange} placeholder="Nom du patient" />
        <Input name="patientAge" value={form.patientAge} onChange={handleFormChange} placeholder="Âge" />
        <Input name="patientPoids" value={form.patientPoids} onChange={handleFormChange} placeholder="Poids" />
      </div>

      <Input type="date" name="date" value={form.date} onChange={handleFormChange} />

      {/* Médicaments */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ajouter un médicament</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Nom" value={newMedicament.nom} onChange={(e) => setNewMedicament((m) => ({ ...m, nom: e.target.value }))} />
          <Input placeholder="Posologie" value={newMedicament.posologie} onChange={(e) => setNewMedicament((m) => ({ ...m, posologie: e.target.value }))} />
          <Input placeholder="AR" value={newMedicament.ar} onChange={(e) => setNewMedicament((m) => ({ ...m, ar: e.target.value }))} />
          <Input placeholder="QSP" value={newMedicament.qsp} onChange={(e) => setNewMedicament((m) => ({ ...m, qsp: e.target.value }))} />
          <div className="flex items-center gap-2">
            <Checkbox checked={newMedicament.mte} onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, mte: !!v }))} />
            <Label>MTE</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={newMedicament.nr} onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, nr: !!v }))} />
            <Label>NR</Label>
          </div>
        </div>
        <Button onClick={handleAddMedicament}>Ajouter</Button>

        <ul className="mt-4 space-y-2">
          {medicaments.map((med, i) => (
            <li key={i} className="border p-2 rounded flex justify-between">
              <div>
                <strong>{med.nom}</strong> – {med.posologie}
                {med.mte && ' • MTE'} {med.ar && ` • AR ${med.ar}`} {med.qsp && ` • QSP ${med.qsp}`} {med.nr && ' • NR'}
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleRemoveMedicament(i)}>Supprimer</Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Conseils */}
      <Textarea name="conseils" rows={4} value={form.conseils} onChange={handleFormChange} placeholder="Conseils au patient" />

      <div className="text-center mt-6">
        <Button className="px-6 py-3 text-lg" onClick={handleGeneratePDF}>🧾 Générer PDF</Button>
      </div>
    </div>
  )
}