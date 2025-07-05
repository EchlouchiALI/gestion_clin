'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const questions = [
  { id: 1, text: "As-tu des douleurs au niveau de la poitrine ?" },
  { id: 2, text: "As-tu des problèmes de peau ?" },
  { id: 3, text: "As-tu souvent des maux de tête ?" },
  { id: 4, text: "As-tu des douleurs articulaires ?" },
  { id: 5, text: "As-tu des troubles digestifs ?" },
]

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

export default function PagePrendreRdv() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [specialite, setSpecialite] = useState<string | null>(null)
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null)
  const [date, setDate] = useState("")
  const [heure, setHeure] = useState("")

  const handleAnswer = (id: number, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const getSpecialite = () => {
    if (answers[1] === "Oui") return "Cardiologie"
    if (answers[2] === "Oui") return "Dermatologie"
    if (answers[3] === "Oui") return "Neurologie"
    if (answers[4] === "Oui") return "Rhumatologie"
    if (answers[5] === "Oui") return "Gastro-entérologie"
    return "Médecine Générale"
  }

  const handleValidate = () => {
    const sp = getSpecialite()
    setSpecialite(sp)
  }

  // Charger tous les médecins après validation du QCM
  useEffect(() => {
    if (!specialite) return

    const fetchMedecins = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3001/patient/medecins", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setMedecins(data)
        } else {
          console.error("Réponse invalide :", data)
        }
      } catch (error) {
        console.error("Erreur lors du fetch :", error)
      }
    }

    fetchMedecins()
  }, [specialite])

  const handleSubmit = async () => {
    if (!selectedMedecin || !date || !heure) return alert("Veuillez remplir tous les champs")

    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3001/patient/rendezvous", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        medecinId: selectedMedecin,
        date,
        heure,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      alert("✅ Rendez-vous pris avec succès !")
      // Reset champs
      setSelectedMedecin(null)
      setDate("")
      setHeure("")
    } else {
      alert("❌ Erreur : " + data.message)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {!specialite && (
        <Card className="p-4 space-y-4">
          <CardTitle className="text-xl">🩺 Questionnaire médical</CardTitle>
          <CardContent className="space-y-4">
            {questions.map(q => (
              <div key={q.id}>
                <p>{q.text}</p>
                <div className="space-x-2 mt-2">
                  <Button
                    variant={answers[q.id] === "Oui" ? "default" : "outline"}
                    onClick={() => handleAnswer(q.id, "Oui")}
                  >
                    Oui
                  </Button>
                  <Button
                    variant={answers[q.id] === "Non" ? "default" : "outline"}
                    onClick={() => handleAnswer(q.id, "Non")}
                  >
                    Non
                  </Button>
                </div>
              </div>
            ))}
            <Button
              onClick={handleValidate}
              disabled={Object.keys(answers).length < 5}
            >
              Voir ma spécialité recommandée
            </Button>
          </CardContent>
        </Card>
      )}

      {specialite && (
        <Card className="p-4 space-y-4">
          <CardTitle className="text-xl">
            ✅ Spécialité recommandée : {specialite}
          </CardTitle>
          <CardContent className="space-y-4">
            <Label>Médecin :</Label>
            <select
              className="w-full p-2 border rounded"
              value={selectedMedecin || ""}
              onChange={e => setSelectedMedecin(parseInt(e.target.value))}
            >
              <option value="">-- Choisir un médecin --</option>
              {medecins.map((m) => (
                <option key={m.id} value={m.id}>
                  Dr. {m.nom} {m.prenom} ({m.specialite})
                </option>
              ))}
            </select>

            <div>
              <Label>Date :</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
              <Label>Heure :</Label>
              <Input type="time" value={heure} onChange={e => setHeure(e.target.value)} />
            </div>

            <Button onClick={handleSubmit}>📅 Prendre rendez-vous</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
