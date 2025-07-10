"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, User, Stethoscope } from "lucide-react"

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

export default function ContactMedecinPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchMedecins = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await axios.get("http://localhost:3001/patient/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedecins(res.data)
    } catch (err) {
      console.error("Erreur de chargement des médecins :", err)
    } finally {
      setLoading(false)
    }
  }

  const envoyerDemande = async (medecinId: number) => {
    const token = localStorage.getItem("token")
    try {
      await axios.post(
        "http://localhost:3001/patient/messages/demande",
        { medecinId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      alert("Demande envoyée ✅ Vous serez redirigé(e) vers vos conversations.")
      router.push("/dashboard/patient/conversations")
    } catch (err) {
      console.error("Erreur lors de l'envoi :", err)
      alert("Erreur lors de l'envoi de la demande.")
    }
  }

  useEffect(() => {
    fetchMedecins()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-8">
          <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2 mr-4">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Contacter un Médecin</h1>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Choisissez votre médecin</h2>
              <p className="text-gray-600">Sélectionnez un spécialiste pour envoyer votre demande</p>
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des médecins...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medecins.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun médecin disponible pour le moment</p>
              </div>
            ) : (
              medecins.map((medecin) => (
                <div
                  key={medecin.id}
                  className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Informations du médecin */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Dr {medecin.prenom} {medecin.nom}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">{medecin.specialite}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Disponible</span>
                          </div>
                        </div>
                      </div>

                      {/* Bouton d'action */}
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          onClick={() => envoyerDemande(medecin.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Envoyer demande
                        </Button>
                        <span className="text-xs text-gray-500">Réponse sous 24h</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Information supplémentaire */}
        {medecins.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Comment ça fonctionne ?</h3>
            <div className="space-y-2 text-blue-800">
              <p>• Cliquez sur "Envoyer demande" pour le médecin de votre choix</p>
              <p>• Le médecin recevra votre demande de consultation</p>
              <p>• Vous recevrez une réponse dans vos conversations</p>
              <p>• Vous pourrez alors commencer votre consultation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
