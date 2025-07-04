"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Users,
  UserPlus,
  Stethoscope,
  CalendarDays,
  LogOut,
  RefreshCw,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'


// Fallback stats when no auth token is present (preview / demo mode)


interface Stats {
  totalUsers: number
  totalPatients: number
  totalMedecins: number
  totalRdv: number
  rdvToday?: number
  rdvThisWeek?: number
  totalAllUsers: number;
  
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rdvParJour, setRdvParJour] = useState<{ name: string; rdv: number }[]>([])


  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
  
      const token = localStorage.getItem("token")
      if (!token) return
  
      const res = await axios.get("http://localhost:3001/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      setStats(res.data)
  
      // Exemple de transformation des rendez-vous par jour (adapté à ta structure)
      // Supposons que res.data.rdvDetails est un tableau de RDV avec une date 'dateRdv'
      if (res.data.rdvDetails) {
        const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        const counts = jours.map((jour) => {
          // Compter les rdv pour chaque jour (exemple basique, adapter selon données)
          const count = res.data.rdvDetails.filter((rdv: any) => {
            const date = new Date(rdv.dateRdv)
            return date.toLocaleDateString("fr-FR", { weekday: "short" }) === jour
          }).length
          return { name: jour, rdv: count }
        })
        setRdvParJour(counts)
      } else {
        // Sinon données par défaut ou vide
        setRdvParJour([])
      }
  
      setError("")
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err)
      if (err.response?.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.")
        handleLogout()
      } else {
        setError("Erreur lors du chargement des statistiques.")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  

  useEffect(() => {
    fetchStats()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleRefresh = () => {
    window.location.reload();
  };
  // Navigation handlers
  const handleNavigateToPatients = () => {
    router.push("/dashboard/admin/patients")
  }

  const handleNavigateToMedecins = () => {
    router.push("/dashboard/admin/medecin")
  }

  const handleNavigateToRendezVous = () => {
    router.push("/dashboard/admin/rendezvous")
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    trendValue,
    onClick,
    clickable = false,
  }: {
    icon: any
    label: string
    value: number
    trend?: "up" | "down"
    trendValue?: string
    onClick?: () => void
    clickable?: boolean
  }) => (
    <Card
      className={`bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
        clickable ? "cursor-pointer hover:from-white/15 hover:to-white/10" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold">{value.toLocaleString()}</div>
              <div className="text-sm text-slate-300">{label}</div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {trend && trendValue && (
              <div
                className={`flex items-center space-x-1 text-sm ${trend === "up" ? "text-green-400" : "text-red-400"}`}
              >
                <TrendingUp className={`w-4 h-4 ${trend === "down" ? "rotate-180" : ""}`} />
                <span>{trendValue}</span>
              </div>
            )}
            {clickable && <ArrowRight className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const StatCardSkeleton = () => (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
                <p className="text-slate-300">Administration du système médical</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-1 text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:text-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatCard
                icon={Users}
                label="Utilisateurs totaux"
                value={stats.totalAllUsers}
                trend="up"
                
              />
              <StatCard
                icon={UserPlus}
                label="Patients"
                value={stats.totalPatients}
                trend="up"
                
                onClick={handleNavigateToPatients}
                clickable={true}
              />
              <StatCard
                icon={Stethoscope}
                label="Médecins"
                value={stats.totalMedecins}
                trend="up"
                
                onClick={handleNavigateToMedecins}
                clickable={true}
              />
              <StatCard
                icon={CalendarDays}
                label="Rendez-vous"
                value={stats.totalRdv}
                trend="up"
                
                onClick={handleNavigateToRendezVous}
                clickable={true}
              />
            </>
          ) : null}
        </div>
        
      </div>
    </div>
  )
  

}
