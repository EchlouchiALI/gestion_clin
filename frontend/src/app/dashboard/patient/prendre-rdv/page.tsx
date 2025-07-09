"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Heart,
  Palette,
  Brain,
  Baby,
  StickerIcon as Stomach,
  Ear,
  Zap,
  Bone,
  UserCheck,
  CalendarDays,
  Clock3,
  Trash,
  Edit3,
  FileDown,
  Check,
  User,
  Activity,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"
import jsPDF from "jspdf"
import QRCode from "qrcode"
import { useRouter } from "next/navigation"

const questions = [
  { id: 1, text: "As-tu des douleurs au niveau de la poitrine ?", icon: Heart },
  { id: 2, text: "As-tu des problèmes de peau, boutons ou eczéma ?", icon: Palette },
  { id: 3, text: "As-tu souvent des angoisses ou troubles psychologiques ?", icon: Brain },
  { id: 4, text: "As-tu des douleurs pelviennes ou des règles irrégulières ?", icon: Baby },
  { id: 5, text: "As-tu des troubles digestifs ou douleurs abdominales ?", icon: Stomach },
  { id: 6, text: "As-tu des problèmes d'audition ou de gorge ?", icon: Ear },
  { id: 7, text: "As-tu souvent des maux de tête ou des vertiges ?", icon: Zap },
  { id: 8, text: "As-tu des douleurs aux articulations ou aux os ?", icon: Bone },
]

type Medecin = {
  id: number
  nom: string
  prenom: string
  specialite: string
}

type Rendezvous = {
  id: number
  date: string
  heure: string
  medecin: Medecin
}
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    startVoiceCommand: () => void
  }
}


export default function PagePrendreRdv() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [specialite, setSpecialite] = useState<string | null>(null)
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [selectedMedecin, setSelectedMedecin] = useState<number | null>(null)
  const [date, setDate] = useState("")
  const [heure, setHeure] = useState("")
  const [rendezvousList, setRendezvousList] = useState<Rendezvous[]>([])
  const [editingRdvId, setEditingRdvId] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState<"questionnaire" | "selection" | "confirmation">("questionnaire")

  const router = useRouter()

  const handleAnswer = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const getSpecialite = () => {
    if (answers[1] === "Oui") return "Cardiologie"
    if (answers[2] === "Oui") return "Dermatologie"
    if (answers[3] === "Oui") return "Psychiatrie"
    if (answers[4] === "Oui") return "Gynécologie"
    if (answers[5] === "Oui") return "Gastro-entérologie"
    if (answers[6] === "Oui") return "ORL"
    if (answers[7] === "Oui") return "Neurologie"
    if (answers[8] === "Oui") return "Rhumatologie"
    return "Médecine Générale"
  }

  const handleValidate = () => {
    const sp = getSpecialite()
    setSpecialite(sp)
    setCurrentStep("selection")
  }

  const handleBack = () => {
    if (currentStep === "selection") {
      setCurrentStep("questionnaire")
      setSpecialite(null)
    } else if (currentStep === "confirmation") {
      setCurrentStep("selection")
    }
  }

  useEffect(() => {
    if (!specialite) return

    const fetchMedecins = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/patient/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setMedecins(data)
      }
    }

    fetchMedecins()
  }, [specialite])

  const fetchRendezvous = async () => {
    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3001/rendezvous/patient", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      setRendezvousList(data)
    }
  }

  useEffect(() => {
    fetchRendezvous()
  }, [])

  const handleSubmit = async () => {
    if (!selectedMedecin || !date || !heure) return alert("Veuillez remplir tous les champs")

    const token = localStorage.getItem("token")
    const method = editingRdvId ? "PATCH" : "POST"
    const endpoint = editingRdvId
      ? `http://localhost:3001/rendezvous/${editingRdvId}`
      : "http://localhost:3001/rendezvous/patient"

    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ medecinId: selectedMedecin, date, heure }),
    })

    const data = await res.json()
    if (res.ok) {
      alert(editingRdvId ? "✅ Rendez-vous modifié !" : "✅ Rendez-vous pris !")
      setSelectedMedecin(null)
      setDate("")
      setHeure("")
      setEditingRdvId(null)
      setCurrentStep("questionnaire")
      setSpecialite(null)
      fetchRendezvous()
    } else {
      alert("❌ Erreur : " + data.message)
    }
  }

  const handleEdit = (rdv: Rendezvous) => {
    setEditingRdvId(rdv.id)
    setSelectedMedecin(rdv.medecin.id)
    setDate(rdv.date)
    setHeure(rdv.heure)
    setCurrentStep("selection")
  }

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("❌ Supprimer ce rendez-vous ?")
    if (!confirm) return

    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3001/rendezvous/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      alert("🗑️ Rendez-vous supprimé.")
      fetchRendezvous()
    } else {
      alert("❌ Erreur lors de la suppression.")
    }
  }
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
  
    let isRecognizing = false;
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("🎙️ Texte reconnu :", transcript);
  
      const match = transcript.match(/docteur (\w+).*?(\d{1,2} \w+).*?(\d{1,2}) ?h/);
  
      if (match) {
        const nomMedecin = match[1];
        const dateStr = match[2];
        const heureStr = match[3];
  
        const medecin = medecins.find(m => m.nom.toLowerCase().includes(nomMedecin));
        if (medecin) {
          setSelectedMedecin(medecin.id);
        } else {
          alert("Médecin non trouvé.");
        }
  
        const mois = {
          janvier: "01", février: "02", mars: "03", avril: "04", mai: "05", juin: "06",
          juillet: "07", août: "08", septembre: "09", octobre: "10", novembre: "11", décembre: "12"
        };
  
        const [jour, moisParle] = dateStr.split(" ");
        const moisNum = mois[moisParle as keyof typeof mois];
        const year = new Date().getFullYear();
  
        if (moisNum) {
          setDate(`${year}-${moisNum}-${jour.padStart(2, "0")}`);
        }
  
        setHeure(`${heureStr.padStart(2, "0")}:00`);
      } else {
        alert("Je n'ai pas compris. Essayez : Docteur Khalil le 12 juillet à 14h");
      }
    };
  
    recognition.onend = () => {
      isRecognizing = false;
    };
  
    (window as any).startVoiceCommand = () => {
      if (isRecognizing) {
        console.warn("🎧 Déjà en cours d'écoute.");
        return;
      }
      isRecognizing = true;
      recognition.start();
    };
  }, [medecins]);
  
  const generatePDF = async (rdv: Rendezvous) => {
    const doc = new jsPDF()
    const qrData = `Rendez-vous avec Dr. ${rdv.medecin.nom} ${rdv.medecin.prenom} - ${rdv.date} à ${rdv.heure}`
    const qrCodeUrl = await QRCode.toDataURL(qrData)

    doc.setFontSize(18)
    doc.text("Détails du Rendez-vous", 20, 20)
    doc.setFontSize(12)
    doc.text(`Médecin : Dr. ${rdv.medecin.nom} ${rdv.medecin.prenom}`, 20, 40)
    doc.text(`Spécialité : ${rdv.medecin.specialite}`, 20, 50)
    doc.text(`Date : ${rdv.date}`, 20, 60)
    doc.text(`Heure : ${rdv.heure}`, 20, 70)
    doc.addImage(qrCodeUrl, "PNG", 140, 30, 50, 50)
    doc.save(`rendezvous_${rdv.id}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Bouton retour page précédente */}
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la page précédente
        </Button>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-200 mb-6">
            <Activity className="w-10 h-10 text-slate-700" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">MediConsult</h1>
          <p className="text-slate-600 text-lg">Plateforme de consultation médicale</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === "questionnaire"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              1
            </div>
            <div className="w-16 h-0.5 bg-slate-300"></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === "selection"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              2
            </div>
            <div className="w-16 h-0.5 bg-slate-300"></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === "confirmation"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              3
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Back Button */}
            {currentStep !== "questionnaire" && (
              <Button
                onClick={handleBack}
                variant="ghost"
                className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
            )}
            <Button
  onClick={() => (window as any).startVoiceCommand()}
  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-md"
>
  🎤 Parler pour remplir automatiquement
</Button>


            {/* Questionnaire */}
            {currentStep === "questionnaire" && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200">
                <div className="p-8 border-b border-slate-100">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Questionnaire médical</h2>
                  <p className="text-slate-600 text-lg">
                    Répondez aux questions suivantes pour obtenir une recommandation personnalisée
                  </p>
                </div>
                <div className="p-8 space-y-6">
                  {questions.map((q) => {
                    const IconComponent = q.icon
                    return (
                      <div
                        key={q.id}
                        className="group bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-blue-300 transition-colors">
                            <IconComponent className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 font-semibold mb-4 text-lg">{q.text}</p>
                            <div className="flex space-x-3">
                              <Button
                                size="sm"
                                variant={answers[q.id] === "Oui" ? "default" : "outline"}
                                onClick={() => handleAnswer(q.id, "Oui")}
                                className={`${
                                  answers[q.id] === "Oui"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                    : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
                                } px-8 py-2 rounded-xl font-semibold transition-all duration-200`}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Oui
                              </Button>
                              <Button
                                size="sm"
                                variant={answers[q.id] === "Non" ? "default" : "outline"}
                                onClick={() => handleAnswer(q.id, "Non")}
                                className={`${
                                  answers[q.id] === "Non"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                    : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
                                } px-8 py-2 rounded-xl font-semibold transition-all duration-200`}
                              >
                                ✕ Non
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-6">
                    <Button
                      onClick={handleValidate}
                      disabled={Object.keys(answers).length < 8}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-bold rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Continuer
                      <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sélection médecin */}
            {currentStep === "selection" && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200">
                <div className="p-8 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Choisir un médecin</h2>
                      <p className="text-slate-600 text-lg">Sélectionnez votre médecin et votre créneau</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-2xl font-bold text-lg">
                      {specialite}
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {medecins.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-slate-600 text-xl">Aucun médecin disponible pour {specialite}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Sélection médecin */}
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Nos spécialistes</h3>
                        <div className="space-y-4">
                          {medecins.map((medecin) => (
                            <div
                              key={medecin.id}
                              onClick={() => setSelectedMedecin(medecin.id)}
                              className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedMedecin === medecin.id
                                  ? "bg-blue-50 border-blue-500 shadow-lg"
                                  : "bg-slate-50 border-slate-200 hover:border-blue-300 hover:shadow-md"
                              } border-2 rounded-2xl p-6`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                      selectedMedecin === medecin.id
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "bg-white text-slate-600 border border-slate-200"
                                    } transition-all duration-200`}
                                  >
                                    <User className="w-8 h-8" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-xl">
                                      Dr. {medecin.nom} {medecin.prenom}
                                    </h4>
                                    <p className="text-slate-600 font-medium">{medecin.specialite}</p>
                                  </div>
                                </div>
                                {selectedMedecin === medecin.id && (
                                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Date et heure */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-slate-900 font-bold text-lg mb-4 block">Date du rendez-vous</Label>
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-14 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-900 font-bold text-lg mb-4 block">Heure du rendez-vous</Label>
                          <Input
                            type="time"
                            value={heure}
                            onChange={(e) => setHeure(e.target.value)}
                            className="h-14 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Bouton confirmation */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedMedecin || !date || !heure}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-bold rounded-2xl shadow-xl disabled:opacity-50 transition-all duration-200"
                      >
                        {editingRdvId ? "Modifier le rendez-vous" : "Confirmer le rendez-vous"}
                        <Check className="w-6 h-6 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar RDV */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 sticky top-6">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center text-lg">
                    <CalendarDays className="w-5 h-5 mr-2" />
                    Mes rendez-vous
                  </h3>
                  {rendezvousList.length > 0 && (
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      {rendezvousList.length}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {rendezvousList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">Aucun rendez-vous</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rendezvousList.map((rdv) => (
                      <div
                        key={rdv.id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                Dr. {rdv.medecin.nom} {rdv.medecin.prenom}
                              </p>
                              <p className="text-slate-600 text-xs">{rdv.medecin.specialite}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <div className="flex items-center space-x-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>{rdv.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock3 className="w-3 h-3" />
                              <span>{rdv.heure}</span>
                            </div>
                          </div>

                          <div className="flex justify-between pt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(rdv)}
                              className="h-7 px-2 text-xs hover:bg-blue-100 hover:text-blue-700"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(rdv.id)}
                              className="h-7 px-2 text-xs hover:bg-red-100 hover:text-red-700"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generatePDF(rdv)}
                              className="h-7 px-2 text-xs hover:bg-green-100 hover:text-green-700"
                            >
                              <FileDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
