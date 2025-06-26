"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { Calendar, Stethoscope, Clock } from "lucide-react"
import { toast } from "sonner"

interface Medecin {
  nom: string;
  prenom: string;
}

interface RendezVous {
  id: number;
  date: string;
  heure: string;
  motif: string;
  medecin: Medecin;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<RendezVous[]>([])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/rendezvous/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAppointments(res.data)
    } catch (err) {
      toast.error("Erreur lors du chargement des rendez-vous")
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mes Rendez-vous</h1>
      {appointments.length === 0 ? (
        <p className="text-gray-500">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((rdv) => (
            <div key={rdv.id} className="bg-white shadow-md rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Stethoscope className="text-blue-600 mr-2" />
                <p className="text-lg font-semibold">
                  Dr. {rdv.medecin?.nom} {rdv.medecin?.prenom}
                </p>
              </div>
              <div className="flex items-center mb-2">
                <Calendar className="text-gray-500 mr-2" />
                <span>{new Date(rdv.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-gray-500 mr-2" />
                <span>{rdv.heure}</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">Motif : {rdv.motif}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
