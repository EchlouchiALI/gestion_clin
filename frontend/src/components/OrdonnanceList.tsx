'use client'

import { useEffect, useState } from 'react'
import { Ordonnance } from '@/types/ordonnance'
import OrdonnanceForm from './OrdonnanceForm'
import OrdonnanceActions from './OrdonnanceActions'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './ui/dialog'

export default function OrdonnanceList() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([])
  const [selected, setSelected] = useState<Ordonnance | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)

  const fetchOrdonnances = async () => {
    try {
      const res = await fetch('http://localhost:3001/medecin/ordonnances', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      if (!res.ok) {
        console.error('❌ Erreur lors de la récupération des ordonnances')
        return
      }

      const data = await res.json()
      console.log('📋 Ordonnances reçues:', data)
      setOrdonnances(data)
    } catch (error) {
      console.error('Erreur de chargement des ordonnances :', error)
    }
  }

  useEffect(() => {
    fetchOrdonnances()
  }, [])

  const handleNewOrdonnance = () => {
    setSelected(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelected(null)
    fetchOrdonnances()
  }

  const handleSubmitCustomOrdonnance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      nom: formData.get('nom'),
      age: formData.get('age'),
      poids: formData.get('poids'),
      medicaments: formData.get('medicaments'),
      recommandations: formData.get('recommandations'),
    }

    try {
      const res = await fetch('http://localhost:3001/medecin/ordonnances/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Erreur lors de la génération du PDF')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')

      setShowCustomForm(false)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Échec de génération de l’ordonnance.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button
          onClick={handleNewOrdonnance}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Nouvelle ordonnance
        </Button>
        <Button
          onClick={() => setShowCustomForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          📄 Ordonnance personnalisée
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow bg-white">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-left text-sm uppercase font-bold text-gray-600">
            <tr>
              <th className="p-4">👨‍⚕️ Patient</th>
              <th className="p-4">📅 Date</th>
              <th className="p-4">📝 Contenu</th>
              <th className="p-4">⚙️ Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordonnances.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500 italic">
                  Aucune ordonnance trouvée.
                </td>
              </tr>
            ) : (
              ordonnances.map((ord) => (
                <tr key={ord.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {ord.patient.nom} {ord.patient.prenom}
                  </td>
                  <td className="p-4">{ord.date}</td>
                  <td className="p-4 truncate max-w-xs">{ord.contenu}</td>
                  <td className="p-4">
                    <OrdonnanceActions
                      ordonnance={ord}
                      refresh={fetchOrdonnances}
                      setSelected={setSelected}
                      setShowForm={setShowForm}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <OrdonnanceForm
          ordonnance={selected}
          onClose={handleCloseForm}
        />
      )}

      {/* ✅ Modale ordonnance personnalisée */}
      <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
        <DialogContent>
          <DialogTitle>Nouvelle ordonnance personnalisée</DialogTitle>
          <form onSubmit={handleSubmitCustomOrdonnance} className="space-y-4 mt-4">
            <Input name="nom" placeholder="Nom du patient" required />
            <Input name="age" placeholder="Âge" required />
            <Input name="poids" placeholder="Poids" required />
            <Textarea name="medicaments" placeholder="Liste des médicaments" required />
            <Textarea name="recommandations" placeholder="Recommandations" />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCustomForm(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer PDF</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
