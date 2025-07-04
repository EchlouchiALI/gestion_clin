'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

const questions = [
  { id: 1, text: "Avez-vous des douleurs thoraciques ?", field: "q1" },
  { id: 2, text: "Avez-vous une éruption cutanée ?", field: "q2" },
  { id: 3, text: "Souffrez-vous de maux de tête fréquents ?", field: "q3" },
  { id: 4, text: "Avez-vous des troubles respiratoires ?", field: "q4" },
  { id: 5, text: "Souffrez-vous de douleurs articulaires ?", field: "q5" },
]

export default function PrendreRDVPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [specialite, setSpecialite] = useState<string | null>(null)

  const handleAnswer = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // 🔁 Logique simple de spécialité basée sur les réponses
    if (answers.q1 === "oui") setSpecialite("Cardiologue")
    else if (answers.q2 === "oui") setSpecialite("Dermatologue")
    else if (answers.q3 === "oui") setSpecialite("Neurologue")
    else if (answers.q4 === "oui") setSpecialite("Pneumologue")
    else if (answers.q5 === "oui") setSpecialite("Rhumatologue")
    else setSpecialite("Médecin généraliste")
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Prise de rendez-vous - Questionnaire</h1>

        {!specialite ? (
          <Card>
            <CardContent className="space-y-6 py-6">
              {questions.map(q => (
                <div key={q.id}>
                  <p className="font-medium mb-2">{q.text}</p>
                  <div className="flex gap-4">
                    <Button
                      variant={answers[q.field] === "oui" ? "default" : "outline"}
                      onClick={() => handleAnswer(q.field, "oui")}
                    >
                      Oui
                    </Button>
                    <Button
                      variant={answers[q.field] === "non" ? "default" : "outline"}
                      onClick={() => handleAnswer(q.field, "non")}
                    >
                      Non
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={handleSubmit} className="w-full mt-4">
                Valider mes réponses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-10">
              <h2 className="text-xl font-semibold mb-4">Spécialité recommandée :</h2>
              <p className="text-2xl text-purple-700 font-bold">{specialite}</p>

              <Button
                onClick={() => {
                  setSpecialite(null)
                  setAnswers({})
                }}
                className="mt-6"
              >
                Recommencer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
