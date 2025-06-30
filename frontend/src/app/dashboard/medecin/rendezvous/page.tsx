"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, User } from "lucide-react"
import { toast } from "sonner"

interface Patient {
  nom: string
  prenom: string
}

interface RendezVous {
  id: number
  date: string
  heure: string
  motif: string
  patient: Patient
  statut: string
}

export default function MedecinRendezVousPage() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([])

  const fetchRdv = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/medecin/me/rendezvous", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setRendezvous(data)
    } catch (err) {
      console.error("Erreur chargement rendez-vous", err)
      toast.error("Impossible de charger les rendez-vous")
    }
  }

  useEffect(() => {
    fetchRdv()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mes Rendez-vous</h1>
      {rendezvous.length === 0 ? (
        <p className="text-gray-500">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rendezvous.map((rdv) => (
            <div key={rdv.id} className="bg-white shadow-md rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-blue-600" />
                <p className="font-semibold">
                  {rdv.patient.prenom} {rdv.patient.nom}
                </p>
              </div>
              <div className="flex items-center mb-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(rdv.date).toLocaleDateString()}
              </div>
              <div className="flex items-center mb-1 text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {rdv.heure}
              </div>
              <p className="text-sm text-gray-600">Motif : {rdv.motif}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
