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
  FileText,
  ArrowRight,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CustomLineChart } from "@/components/charts/line-chart"
import { CustomBarChart } from "@/components/charts/bar-chart"
import { CustomPieChart } from "@/components/charts/pie-chart"

interface Stats {
  totalUsers: number
  totalPatients: number
  totalMedecins: number
  totalRdv: number
  rdvToday?: number
  rdvThisWeek?: number
}

// Mock data for charts
const monthlyData = [
  { month: "Jan", patients: 45, medecins: 12, rdv: 180, revenus: 15000 },
  { month: "Fév", patients: 52, medecins: 13, rdv: 210, revenus: 17500 },
  { month: "Mar", patients: 48, medecins: 14, rdv: 195, revenus: 16200 },
  { month: "Avr", patients: 61, medecins: 15, rdv: 245, revenus: 20300 },
  { month: "Mai", patients: 55, medecins: 16, rdv: 220, revenus: 18800 },
  { month: "Jun", patients: 67, medecins: 17, rdv: 268, revenus: 22400 },
]

const specialiteData = [
  { name: "Cardiologie", value: 35, patients: 120 },
  { name: "Dermatologie", value: 25, patients: 85 },
  { name: "Pédiatrie", value: 20, patients: 68 },
  { name: "Neurologie", value: 15, patients: 51 },
  { name: "Autres", value: 5, patients: 17 },
]

const weeklyRdvData = [
  { day: "Lun", rdv: 45, taux: 85 },
  { day: "Mar", rdv: 52, taux: 92 },
  { day: "Mer", rdv: 48, taux: 88 },
  { day: "Jeu", rdv: 61, taux: 95 },
  { day: "Ven", rdv: 55, taux: 90 },
  { day: "Sam", rdv: 32, taux: 70 },
  { day: "Dim", rdv: 18, taux: 45 },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification manquant")
      }

      const res = await axios.get("http://localhost:3001/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(res.data)
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
    fetchStats(true)
  }

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
                value={stats.totalUsers}
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                icon={UserPlus}
                label="Patients"
                value={stats.totalPatients}
                trend="up"
                trendValue="+8%"
                onClick={handleNavigateToPatients}
                clickable={true}
              />
              <StatCard
                icon={Stethoscope}
                label="Médecins"
                value={stats.totalMedecins}
                trend="up"
                trendValue="+3%"
                onClick={handleNavigateToMedecins}
                clickable={true}
              />
              <StatCard
                icon={CalendarDays}
                label="Rendez-vous"
                value={stats.totalRdv}
                trend="up"
                trendValue="+15%"
                onClick={handleNavigateToRendezVous}
                clickable={true}
              />
            </>
          ) : null}
        </div>

        {/* Quick Actions */}
        

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Activité récente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Rendez-vous aujourd'hui</span>
                    <span className="font-semibold">{stats.rdvToday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Rendez-vous cette semaine</span>
                    <span className="font-semibold">{stats.rdvThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Taux d'occupation</span>
                    <span className="font-semibold text-green-400">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Statut du système</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Serveur</span>
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400">En ligne</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Base de données</span>
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400">Connectée</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Dernière sauvegarde</span>
                    <span className="text-slate-300">Il y a 2h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Statistics */}
        <div className="mt-8 space-y-6">
          {/* Revenue and Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Évolution mensuelle des patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomLineChart data={monthlyData} dataKey="patients" xAxisKey="month" color="#06B6D4" />
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-cyan-400 font-semibold">+23%</div>
                    <div className="text-slate-400">vs mois dernier</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">67</div>
                    <div className="text-slate-400">Ce mois</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-semibold">341</div>
                    <div className="text-slate-400">Total 6 mois</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Revenus mensuels (€)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomBarChart data={monthlyData} dataKey="revenus" xAxisKey="month" color="#8B5CF6" />
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">+18%</div>
                    <div className="text-slate-400">Croissance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-semibold">22,400€</div>
                    <div className="text-slate-400">Ce mois</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">110,200€</div>
                    <div className="text-slate-400">Total 6 mois</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialties and Weekly Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Répartition par spécialité</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomPieChart data={specialiteData} dataKey="patients" nameKey="name" />
                <div className="mt-4 space-y-2">
                  {specialiteData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"][index] }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.patients} patients</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Performance hebdomadaire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomBarChart data={weeklyRdvData} dataKey="rdv" xAxisKey="day" color="#10B981" />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Taux d'occupation moyen</div>
                    <div className="text-2xl font-bold text-green-400">82%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Meilleur jour</div>
                    <div className="text-lg font-semibold text-white">Jeudi (95%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Indicateurs de performance clés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-400">4.8/5</div>
                  <div className="text-sm text-slate-400">Satisfaction patients</div>
                  <div className="text-xs text-green-400">+0.3 vs mois dernier</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-400">12min</div>
                  <div className="text-sm text-slate-400">Temps d'attente moyen</div>
                  <div className="text-xs text-green-400">-2min vs mois dernier</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-purple-400">94%</div>
                  <div className="text-sm text-slate-400">Taux de présence</div>
                  <div className="text-xs text-green-400">+2% vs mois dernier</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-yellow-400">€187</div>
                  <div className="text-sm text-slate-400">Revenus par patient</div>
                  <div className="text-xs text-green-400">+€15 vs mois dernier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
