'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({})
  const [specialite, setSpecialite] = useState('')
  const [medecins, setMedecins] = useState<any[]>([])
  const [selectedMedecinId, setSelectedMedecinId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [message, setMessage] = useState('')

  const questions = [
    { id: 'q1', text: 'Ressentez-vous des douleurs thoraciques ?' },
    { id: 'q2', text: 'Avez-vous des maux de tête fréquents ?' },
    { id: 'q3', text: 'Souffrez-vous de troubles digestifs ?' },
    { id: 'q4', text: 'Avez-vous des troubles du sommeil ?' },
    { id: 'q5', text: 'Souhaitez-vous un bilan de santé général ?' },
  ]

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers({ ...answers, [id]: value })
  }

  const analyserReponses = () => {
    const score = {
      Cardiologue: answers.q1 ? 1 : 0,
      Neurologue: answers.q2 ? 1 : 0,
      'Gastro-entérologue': answers.q3 ? 1 : 0,
      Psychiatre: answers.q4 ? 1 : 0,
      'Médecin généraliste': answers.q5 ? 1 : 0,
    }

    // Trouver la spécialité avec le score le plus élevé
    const specialiteMax = Object.entries(score).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    setSpecialite(specialiteMax)
    setStep(2)
  }

  useEffect(() => {
    const fetchMedecins = async () => {
      if (!specialite) return
      try {
        const res = await fetch(`http://localhost:3001/medecins?specialite=${specialite}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setMedecins(data)
        } else {
          console.error('Réponse inattendue :', data)
          setMedecins([])
        }
      } catch (error) {
        console.error('Erreur chargement médecins :', error)
        setMedecins([])
      }
    }
  
    fetchMedecins()
  }, [specialite])
  

  const handleRdvSubmit = async () => {
    if (!selectedMedecinId || !date || !heure || !motif) {
      alert('Veuillez remplir tous les champs.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3001/patient/rendezvous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          heure,
          motif,
          medecinId: selectedMedecinId,
        }),
      })

      if (res.ok) {
        setMessage('✅ Rendez-vous réservé avec succès !')
        setStep(1)
        setAnswers({})
        setSpecialite('')
        setSelectedMedecinId(null)
        setDate('')
        setHeure('')
        setMotif('')
      } else {
        const err = await res.json()
        setMessage(`❌ Erreur : ${err.message || 'Échec'}`)
      }
    } catch (error) {
      console.error('Erreur envoi RDV :', error)
      setMessage("Erreur lors de l'envoi du RDV.")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 Prise de rendez-vous intelligente</h1>

      {step === 1 && (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border p-4 rounded">
              <p className="mb-2 font-medium">{q.text}</p>
              <div className="flex gap-4">
                <Button
                  variant={answers[q.id] === true ? 'default' : 'outline'}
                  onClick={() => handleAnswer(q.id, true)}
                >
                  Oui
                </Button>
                <Button
                  variant={answers[q.id] === false ? 'default' : 'outline'}
                  onClick={() => handleAnswer(q.id, false)}
                >
                  Non
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={analyserReponses}>Analyser mes réponses</Button>
        </div>
      )}

      {step === 2 && (
        <>
          <p className="mb-4">🔍 Spécialité recommandée : <strong>{specialite}</strong></p>

          <div className="grid gap-4 mb-6">
            {medecins.map((m) => (
              <div
                key={m.id}
                className={`p-4 border rounded cursor-pointer ${
                  selectedMedecinId === m.id ? 'bg-blue-100' : ''
                }`}
                onClick={() => setSelectedMedecinId(m.id)}
              >
                <p><strong>{m.nom} {m.prenom}</strong></p>
                <p>Email : {m.email}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-4">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
            <Textarea placeholder="Motif du rendez-vous" value={motif} onChange={(e) => setMotif(e.target.value)} />
          </div>

          <Button onClick={handleRdvSubmit}>Réserver le RDV</Button>
        </>
      )}

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}
