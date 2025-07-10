"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
  ChevronLeft,
  Sparkles,
  Star,
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

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
]

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
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
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "fr-FR"
    recognition.interimResults = false

    let isRecognizing = false

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      console.log("🎙️ Texte reconnu :", transcript)

      const doctorMatch = transcript.match(
        /(?:docteur|dr)\s+([\w\s-]+)/i,
      )
      const dateMatch = transcript.match(
        /(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)/i,
      )
      const timeMatch = transcript.match(/(\d{1,2})\s*(?:h|heures?)/i)

      if (doctorMatch && dateMatch && timeMatch) {
        const nomMedecin = doctorMatch[1]

        const medecin = medecins.find((m) => {
          const search = nomMedecin.toLowerCase().trim()
          const full1 = `dr ${m.nom} ${m.prenom}`.toLowerCase()
          const full2 = `dr ${m.prenom} ${m.nom}`.toLowerCase()
          return full1.includes(search) || full2.includes(search)
        })


        if (!medecin) {
          alert("❌ Médecin non trouvé.")
          return
        }

        const [jour, moisParle] = [dateMatch[1], dateMatch[2]]
        const mois = {
          janvier: "01",
          février: "02",
          mars: "03",
          avril: "04",
          mai: "05",
          juin: "06",
          juillet: "07",
          août: "08",
          septembre: "09",
          octobre: "10",
          novembre: "11",
          décembre: "12",
        }

        const moisNum = mois[moisParle as keyof typeof mois]
        const year = new Date().getFullYear()

        const finalDate = `${year}-${moisNum}-${jour.padStart(2, "0")}`
        const finalHeure = `${timeMatch[1].padStart(2, "0")}:00`

        // 📤 Envoi automatique
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3001/rendezvous/patient", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medecinId: medecin.id,
            date: finalDate,
            heure: finalHeure,
          }),
        })

        const data = await res.json()
        if (res.ok) {
          alert("✅ Rendez-vous pris avec succès !")
          setSelectedMedecin(null)
          setDate("")
          setHeure("")
          fetchRendezvous()
          setCurrentStep("questionnaire")
          setSpecialite(null)
        } else {
          alert("❌ Erreur serveur : " + data.message)
        }
      } else {
        alert("❌ Je n'ai pas compris. Exemple : Docteur Khalil le 12 juillet à 14h")
      }
    }

    recognition.onend = () => {
      isRecognizing = false
    }
    ;(window as any).startVoiceCommand = () => {
      if (isRecognizing) {
        console.warn("🎧 Déjà en cours d'écoute.")
        return
      }
      isRecognizing = true
      recognition.start()
    }
  }, [medecins])

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

  // Calendar functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) return // Ne pas permettre de sélectionner des dates passées

    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setDate(formattedDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const today = new Date()
    const selectedDate = date ? new Date(date) : null

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day)
      const isToday = currentDate.toDateString() === today.toDateString()
      const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString()
      const isPast = currentDate < today

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isPast}
          className={`h-12 w-full rounded-xl font-semibold transition-all duration-200 ${
            isPast
              ? "text-slate-300 cursor-not-allowed"
              : isSelected
                ? "bg-blue-600 text-white shadow-lg"
                : isToday
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Bouton retour page précédente */}
      <div className="mb-6 p-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-slate-600 hover:text-slate-900 hover:bg-white/50 flex items-center backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la page précédente
        </Button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header avec animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl border border-white/20 mb-6 relative">
            <Activity className="w-12 h-12 text-white" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            MediConsult
          </h1>
          <p className="text-slate-600 text-xl font-medium">Plateforme de consultation médicale moderne</p>
        </div>

        {/* Progress Steps améliorés */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                  currentStep === "questionnaire"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg scale-110"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium text-slate-600 mt-2">Questionnaire</span>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full"></div>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                  currentStep === "selection"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg scale-110"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-slate-600 mt-2">Sélection</span>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full"></div>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                  currentStep === "confirmation"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg scale-110"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium text-slate-600 mt-2">Confirmation</span>
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
                className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-white/50 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}

            <Button
              onClick={() => (window as any).startVoiceCommand()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl mb-8 transform hover:scale-105 transition-all duration-200"
            >
              🎤 Commande vocale intelligente
            </Button>

            {/* Questionnaire amélioré */}
            {currentStep === "questionnaire" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
                <div className="p-8 border-b border-slate-100/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Questionnaire médical</h2>
                      <p className="text-slate-600 text-lg">
                        Répondez aux questions suivantes pour obtenir une recommandation personnalisée
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  {questions.map((q, index) => {
                    const IconComponent = q.icon
                    return (
                      <div
                        key={q.id}
                        className="group bg-gradient-to-r from-slate-50 to-white rounded-3xl border border-slate-200/50 p-8 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="flex items-start space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-6">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                {index + 1}/8
                              </span>
                              <p className="text-slate-900 font-bold mb-0 text-xl">{q.text}</p>
                            </div>
                            <div className="flex space-x-4">
                              <button
                                onClick={() => handleAnswer(q.id, "Oui")}
                                className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                  answers[q.id] === "Oui"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-xl"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50"
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      answers[q.id] === "Oui" ? "bg-white/20" : "bg-green-100"
                                    }`}
                                  >
                                    <Check
                                      className={`w-5 h-5 ${answers[q.id] === "Oui" ? "text-white" : "text-green-600"}`}
                                    />
                                  </div>
                                  <span className="font-bold text-lg">Oui</span>
                                </div>
                              </button>

                              <button
                                onClick={() => handleAnswer(q.id, "Non")}
                                className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                  answers[q.id] === "Non"
                                    ? "bg-gradient-to-r from-red-500 to-rose-500 border-red-500 text-white shadow-xl"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50"
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      answers[q.id] === "Non" ? "bg-white/20" : "bg-red-100"
                                    }`}
                                  >
                                    <span
                                      className={`text-xl font-bold ${
                                        answers[q.id] === "Non" ? "text-white" : "text-red-600"
                                      }`}
                                    >
                                      ✕
                                    </span>
                                  </div>
                                  <span className="font-bold text-lg">Non</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-8">
                    <Button
                      onClick={handleValidate}
                      disabled={Object.keys(answers).length < 8}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-2xl font-bold rounded-3xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                      Continuer vers la sélection
                      <ChevronRight className="w-8 h-8 ml-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sélection médecin améliorée */}
            {currentStep === "selection" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
                <div className="p-8 border-b border-slate-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-2">Choisir un médecin</h2>
                      <p className="text-slate-600 text-lg">Sélectionnez votre médecin et votre créneau</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-3xl font-bold text-xl shadow-lg">
                      {specialite}
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {medecins.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-slate-600 text-2xl">Aucun médecin disponible pour {specialite}</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Sélection médecin */}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3"></div>
                          Nos spécialistes
                        </h3>
                        <div className="space-y-6">
                          {medecins.map((medecin) => (
                            <div
                              key={medecin.id}
                              onClick={() => setSelectedMedecin(medecin.id)}
                              className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                selectedMedecin === medecin.id
                                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 shadow-2xl"
                                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl"
                              } border-2 rounded-3xl p-8`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                  <div
                                    className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                                      selectedMedecin === medecin.id
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                    } transition-all duration-300`}
                                  >
                                    <User className="w-10 h-10" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-2xl">
                                      Dr. {medecin.nom} {medecin.prenom}
                                    </h4>
                                    <p className="text-slate-600 font-medium text-lg">{medecin.specialite}</p>
                                  </div>
                                </div>
                                {selectedMedecin === medecin.id && (
                                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                                    <Check className="w-7 h-7 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calendrier et sélecteur d'heure améliorés */}
                      <div className="grid lg:grid-cols-2 gap-10">
                        {/* Calendrier */}
                        <div>
                          <Label className="text-slate-900 font-bold text-xl mb-6 block flex items-center">
                            <CalendarDays className="w-6 h-6 mr-3 text-blue-600" />
                            Choisir une date
                          </Label>
                          <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 shadow-lg">
                            {/* Navigation du mois */}
                            <div className="flex items-center justify-between mb-8">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth("prev")}
                                className="p-3 hover:bg-blue-100 rounded-2xl"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </Button>
                              <h3 className="text-2xl font-bold text-slate-900">
                                {monthNames[currentMonth]} {currentYear}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth("next")}
                                className="p-3 hover:bg-blue-100 rounded-2xl"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </Button>
                            </div>

                            {/* Jours de la semaine */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                              {dayNames.map((day) => (
                                <div key={day} className="text-center text-sm font-bold text-slate-600 py-3">
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
                          </div>
                        </div>

                        {/* Sélecteur d'heure */}
                        <div>
                          <Label className="text-slate-900 font-bold text-xl mb-6 block flex items-center">
                            <Clock3 className="w-6 h-6 mr-3 text-purple-600" />
                            Choisir un horaire
                          </Label>
                          <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 shadow-lg max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                              {timeSlots.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setHeure(time)}
                                  className={`p-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                                    heure === time
                                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl"
                                      : "bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 hover:border-purple-300"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Résumé de la sélection amélioré */}
                      {(date || heure) && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
                          <h4 className="font-bold text-blue-900 mb-6 text-xl flex items-center">
                            <Sparkles className="w-6 h-6 mr-3" />
                            Résumé de votre sélection :
                          </h4>
                          <div className="space-y-4 text-blue-800 text-lg">
                            {selectedMedecin && (
                              <p className="flex items-center">
                                <span className="text-2xl mr-3">👨‍⚕️</span>
                                <strong>Médecin :</strong> Dr. {medecins.find((m) => m.id === selectedMedecin)?.nom}{" "}
                                {medecins.find((m) => m.id === selectedMedecin)?.prenom}
                              </p>
                            )}
                            {date && (
                              <p className="flex items-center">
                                <span className="text-2xl mr-3">📅</span>
                                <strong>Date :</strong>{" "}
                                {new Date(date).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                            {heure && (
                              <p className="flex items-center">
                                <span className="text-2xl mr-3">🕐</span>
                                <strong>Heure :</strong> {heure}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bouton confirmation amélioré */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedMedecin || !date || !heure}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-2xl font-bold rounded-3xl shadow-2xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
                      >
                        {editingRdvId ? "Modifier le rendez-vous" : "Confirmer le rendez-vous"}
                        <Check className="w-8 h-8 ml-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar RDV améliorée */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 sticky top-6">
              <div className="p-6 border-b border-slate-100/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center text-lg">
                    <CalendarDays className="w-5 h-5 mr-2" />
                    Mes rendez-vous
                  </h3>
                  {rendezvousList.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {rendezvousList.length}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {rendezvousList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CalendarDays className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-lg">Aucun rendez-vous</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rendezvousList.map((rdv) => (
                      <div
                        key={rdv.id}
                        className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                Dr. {rdv.medecin.nom} {rdv.medecin.prenom}
                              </p>
                              <p className="text-slate-600 text-xs">{rdv.medecin.specialite}</p>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-white" />
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
                              className="h-7 px-2 text-xs hover:bg-blue-100 hover:text-blue-700 rounded-lg"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(rdv.id)}
                              className="h-7 px-2 text-xs hover:bg-red-100 hover:text-red-700 rounded-lg"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generatePDF(rdv)}
                              className="h-7 px-2 text-xs hover:bg-green-100 hover:text-green-700 rounded-lg"
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
