"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, FileText, Calendar, User, Stethoscope, Clock, Bell, LogOut, Heart } from "lucide-react"

type Patient = {
  nom: string
  prenom: string
  email: string
}

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token manquant")

        const res = await fetch("http://localhost:3001/patient/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Erreur lors du chargement du profil")
        }

        const data = await res.json()
        setPatient(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        localStorage.removeItem("token")
        router.push("/login")
      }
    }

    fetchPatient()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const dashboardCards = [
    {
      title: "Mes ordonnances",
      description: "Consultez et gérez vos prescriptions médicales",
      icon: FileText,
      href: "/dashboard/patient/ordonnances",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Prendre rendez-vous",
      description: "Planifiez votre prochain rendez-vous médical",
      icon: Calendar,
      href: "/dashboard/patient/prendre-rdv",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Contacter médecin",
      description: "Envoyez un message à votre médecin traitant",
      icon: Stethoscope,
      href: "/dashboard/patient/contact-medecin",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Mon profil",
      description: "Gérez vos informations personnelles",
      icon: User,
      href: "/dashboard/patient/profil",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-md">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Bienvenue, {patient?.prenom} {patient?.nom}
                </h1>
                <p className="text-gray-600 mt-1">Gérez votre santé en toute simplicité</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                En ligne
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Rendez-vous ce mois</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">Ordonnances actives</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-gray-600">Message non lu</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              className={`${card.color} border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">{card.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={card.href}>
                  <Button
                    className={`w-full ${card.buttonColor} text-white shadow-md hover:shadow-lg transition-all duration-200`}
                    size="lg"
                  >
                    Accéder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">Rendez-vous confirmé</p>
                  <p className="text-sm text-gray-600">15 janvier 2024 à 14h30</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">Nouvelle ordonnance</p>
                  <p className="text-sm text-gray-600">Reçue il y a 2 jours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Chatbot Button */}
      <Link href="/dashboard/patient/chatbot">
        <Button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
          size="lg"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
          <span className="sr-only">Assistant virtuel</span>
        </Button>
      </Link>

      {/* Tooltip for chatbot */}
      <div className="fixed bottom-20 right-6 bg-white px-3 py-2 rounded-lg shadow-lg text-sm text-gray-700 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        💬 Besoin d'aide ? Parlez à votre assistant virtuel !
      </div>
    </main>
  )
}
