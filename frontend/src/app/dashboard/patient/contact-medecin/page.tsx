"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

type Conversation = {
  id: number
  medecinId: number
  status: 'pending' | 'accepted' | 'rejected'
}

export default function ContactMedecinPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

  // 🔄 Charger les médecins et les conversations du patient
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMed = await axios.get("http://localhost:3001/patient/medecins", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const resConv = await axios.get("http://localhost:3001/patient/conversations", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMedecins(resMed.data)
        setConversations(resConv.data)
      } catch (err) {
        console.error("Erreur de chargement :", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 📩 Demander une conversation
  const handleDemandeConversation = async (medecinId: number) => {
    try {
      await axios.post("http://localhost:3001/patient/conversations", {
        medecinId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert("Demande envoyée !")
      window.location.reload()
    } catch (err) {
      console.error("Erreur en envoyant la demande :", err)
      alert("Erreur lors de la demande.")
    }
  }

  // 📍 Vérifie si une conversation existe déjà
  const getConversationStatus = (medecinId: number) => {
    const conv = conversations.find(c => c.medecinId === medecinId)
    if (!conv) return "Aucune"
    if (conv.status === "pending") return "En attente"
    if (conv.status === "accepted") return "Acceptée"
    if (conv.status === "rejected") return "Refusée"
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Contacter un médecin</h1>

      {medecins.map((medecin) => (
        <div key={medecin.id} className="border p-4 rounded shadow">
          <p><strong>Dr. {medecin.nom} {medecin.prenom}</strong></p>
          <p>Spécialité : {medecin.specialite}</p>
          <p>Statut : {getConversationStatus(medecin.id)}</p>

          {getConversationStatus(medecin.id) === "Aucune" && (
            <Button onClick={() => handleDemandeConversation(medecin.id)}>
              Demander une conversation
            </Button>
          )}

          {getConversationStatus(medecin.id) === "Acceptée" && (
            <Button
              onClick={() => window.location.href = `/dashboard/patient/chat/${medecin.id}`}
            >
              Ouvrir le chat
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
