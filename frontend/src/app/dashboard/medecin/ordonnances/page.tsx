"use client"

import { useEffect, useState } from "react"
import { Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface Patient {
  nom: string
  prenom: string
}

interface Ordonnance {
  id: number
  date: string
  contenu: string
  patient: Patient
}

export default function MedecinOrdonnancesPage() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([])

  const fetchOrdonnances = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/medecin/ordonnances", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setOrdonnances(data)
    } catch (err) {
      console.error("Erreur chargement ordonnances", err)
      toast.error("Impossible de charger les ordonnances")
    }
  }

  useEffect(() => {
    fetchOrdonnances()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mes Ordonnances</h1>
      {ordonnances.length === 0 ? (
        <p className="text-gray-500">Aucune ordonnance.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ordonnances.map((ord) => (
            <div key={ord.id} className="bg-white shadow-md rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-blue-600" />
                <p className="font-semibold">
                  {ord.patient.prenom} {ord.patient.nom}
                </p>
              </div>
              <div className="flex items-center mb-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(ord.date).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {ord.contenu}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}