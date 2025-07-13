"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { API_URL } from "@/lib/config" // Assuming this file exists and exports API_URL
import {
  MessageCircle,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Clock,
  Bell,
  LogOut,
  Heart,
  MapPin,
  Phone,
  Mail,
  Navigation,
} from "lucide-react"

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

        const res = await fetch(`${API_URL}/patient/me`, {
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

        {/* Clinic Location Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <MapPin className="w-6 h-6" />
              Localisation de la Clinique
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Map Section */}
              <div className="h-80 lg:h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.0234567890123!2d-4.99046!3d34.02646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAxJzM1LjIiTiA0wrA1OSczNi40Ilc!5e0!3m2!1sfr!2sma!4v1234567890123!5m2!1sfr!2sma"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation de la clinique"
                />
              </div>
              {/* Contact Information */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Polyclinique Atlas</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Adresse</p>
                      <p className="text-gray-600 text-sm">
                        Rte de Sefrou, Fès 30000
                        <br />
                        Fès 30000, Maroc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Téléphone</p>
                      <p className="text-gray-600 text-sm">0535641697</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-gray-600 text-sm">support@polycliniqueatlas.ma.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">Horaires d'ouverture</p>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>Lun - Ven: 8h00 - 18h00</p>
                        <p>Samedi: 8h00 - 14h00</p>
                        <p>Dimanche: Fermé</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open("https://maps.google.com/?q=34.02646,-4.99046", "_blank")}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Itinéraire
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => window.open("tel:0535641697")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
        {"💬 Besoin d'aide ? Parlez à votre assistant virtuel !"}
      </div>
    </main>
  )
}
