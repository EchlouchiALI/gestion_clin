"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  FileText,
  PlusCircle,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Stethoscope,
  Heart,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Medecin = {
  nom: string
  prenom: string
  email: string
}

type Stats = {
  patients: number
  rdvAujourdhui: number
  ordonnances: number
  rdvSemaine: number
}

export default function DashboardMedecinPage() {
  const [medecin, setMedecin] = useState<Medecin | null>(null)
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    rdvAujourdhui: 0,
    ordonnances: 0,
    rdvSemaine: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")
  
    const headers = { Authorization: `Bearer ${token}` }
  
    const loadData = async () => {
      try {
        const [profileRes, patientsRes, rdvRes, ordRes] = await Promise.all([
          fetch("http://localhost:3001/medecin/me/profile", { headers }),
          fetch("http://localhost:3001/medecin/patients", { headers }),
          fetch("http://localhost:3001/medecin/me/rendezvous", { headers }),
          fetch("http://localhost:3001/medecin/ordonnances", { headers }),
        ])
  
        if (!profileRes.ok) throw new Error("Profil invalide")
  
        const profile = await profileRes.json()
        const patients = patientsRes.ok ? await patientsRes.json() : []
        const rdv = rdvRes.ok ? await rdvRes.json() : []
        const ordonnances = ordRes.ok ? await ordRes.json() : []
  
        setMedecin(profile)
  
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setHours(0, 0, 0, 0)
        startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7))
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
  
        const rdvAuj = rdv.filter(
          (r: any) => new Date(r.date).toDateString() === today.toDateString()
        ).length
  
        const rdvWeek = rdv.filter((r: any) => {
          const d = new Date(r.date)
          return d >= startOfWeek && d <= endOfWeek
        }).length
  
        setStats({
          patients: patients.length,
          rdvAujourdhui: rdvAuj,
          ordonnances: ordonnances.length,
          rdvSemaine: rdvWeek,
        })
      } catch (err) {
        console.error("❌ Erreur chargement dashboard :", err)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
  
    loadData()
  }, [router])
  

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Nouveau Patient",
      description: "Ajouter un nouveau patient",
      icon: PlusCircle,
      color: "from-emerald-500 to-emerald-600",
      onClick: () => router.push("/dashboard/medecin/patient"),
    },
    {
      title: "Rendez-vous",
      description: "Gérer vos rendez-vous",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      onClick: () => router.push("/dashboard/medecin/rendezvous"),
    },
    {
      title: "Ordonnances",
      description: "Créer une ordonnance",
      icon: FileText,
      color: "from-purple-500 to-purple-600",
      onClick: () => router.push("/dashboard/medecin/ordonnances"),
    },
  ]

  const statsCards = [
    {
      title: "Patients Total",
      value: stats.patients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "RDV Aujourd'hui",
      value: stats.rdvAujourdhui,
      icon: Clock,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "3 en attente",
      changeColor: "text-orange-600",
    },
    {
      title: "Ordonnances",
      value: stats.ordonnances,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+8 cette semaine",
      changeColor: "text-green-600",
    },
    {
      title: "RDV Semaine",
      value: stats.rdvSemaine,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "85% complet",
      changeColor: "text-blue-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Médical</h1>
                <p className="text-gray-600">{medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : "Chargement..."}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {medecin ? `${medecin.prenom[0]}${medecin.nom[0]}` : "Dr"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-8 w-8 text-pink-300" />
                <h2 className="text-3xl font-bold">Bonjour Dr. {medecin?.prenom} !</h2>
              </div>
              <p className="text-blue-100 text-lg">
                Vous avez {stats.rdvAujourdhui} rendez-vous aujourd'hui. Bonne journée de consultation !
              </p>
            </div>
            <div className="absolute top-4 right-4 opacity-20">
              <Activity className="h-24 w-24" />
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeColor} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={action.onClick}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-sm overflow-hidden group">
                  <CardContent className="p-0">
                    <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h4>
                          <p className="text-gray-600 text-sm">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Prochains rendez-vous */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Prochains Rendez-vous</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { patient: "Ahmed Benali", time: "09:00", type: "Consultation" },
                  { patient: "Fatima Alami", time: "10:30", type: "Contrôle" },
                  { patient: "Omar Tazi", time: "14:00", type: "Urgence" },
                ].map((rdv, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{rdv.patient}</p>
                      <p className="text-sm text-gray-600">{rdv.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">{rdv.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Activité Récente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Ordonnance créée", patient: "Youssef Amrani", time: "Il y a 2h" },
                  { action: "Nouveau patient", patient: "Aicha Bennani", time: "Il y a 4h" },
                  { action: "RDV confirmé", patient: "Hassan Idrissi", time: "Il y a 6h" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action} - {activity.patient}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
