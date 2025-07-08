"use client"

import type React from "react"

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
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Stats {
  totalUsers: number
  totalPatients: number
  totalMedecins: number
  totalRdv: number
  rdvToday?: number
  rdvThisWeek?: number
  totalAllUsers: number
  rdvDetails?: { name: string; rdv: number }[]
  evolution?: { mois: string; patients: number; medecins: number }[]
  specialites?: { name: string; value: number }[]
}

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
        setError("Token d'authentification manquant")
        return
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
  const handleNavigateToPatients = () => router.push("/dashboard/admin/patients")
  const handleNavigateToMedecins = () => router.push("/dashboard/admin/medecin")
  const handleNavigateToRendezVous = () => router.push("/dashboard/admin/rendezvous")

  // Composant StatCard
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
    value: number | undefined
    trend?: "up" | "down"
    trendValue?: string
    onClick?: () => void
    clickable?: boolean
  }) => (
    <Card
      className={`
        group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl 
        transition-all duration-300 hover:-translate-y-1
        ${clickable ? "cursor-pointer hover:shadow-2xl" : ""}
      `}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {typeof value === "number" ? value.toLocaleString() : "..."}
              </div>
              <div className="text-sm font-medium text-gray-600">{label}</div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {trend && trendValue && (
              <div
                className={`flex items-center space-x-1 text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className={`h-4 w-4 ${trend === "down" ? "rotate-180" : ""}`} />
                <span>{trendValue}</span>
              </div>
            )}
            {clickable && (
              <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Composant StatCardSkeleton
  const StatCardSkeleton = () => (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Composant ChartCard
  const ChartCard = ({
    title,
    children,
    className = "",
  }: {
    title: string
    children: React.ReactNode
    className?: string
  }) => (
    <Card className={`border-0 bg-white shadow-lg ${className}`}>
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
        {children}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-600">Administration du système médical</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                trendValue=""
              />
              <StatCard
                icon={UserPlus}
                label="Patients"
                value={stats.totalPatients}
                trend="up"
                trendValue=""
                onClick={handleNavigateToPatients}
                clickable={true}
              />
              <StatCard
                icon={Stethoscope}
                label="Médecins"
                value={stats.totalMedecins}
                trend="up"
                trendValue=""
                onClick={handleNavigateToMedecins}
                clickable={true}
              />
              <StatCard
                icon={CalendarDays}
                label="Rendez-vous"
                value={stats.totalRdv}
                trend="up"
                trendValue=""
                onClick={handleNavigateToRendezVous}
                clickable={true}
              />
            </>
          ) : null}
        </div>

        {/* Charts */}
        {!loading && stats && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <ChartCard title="Rendez-vous par jour">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.rdvDetails || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="rdv" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Line Chart */}
            <ChartCard title="Évolution mensuelle">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.evolution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mois" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="medecins"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie Chart */}
            <ChartCard title="Répartition des spécialités" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stats.specialites || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(stats.specialites || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"][
                            index % 8
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </main>
    </div>
  )
}
