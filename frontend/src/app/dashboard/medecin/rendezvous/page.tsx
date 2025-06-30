"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, User, Search, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Patient {
  nom: string
  prenom: string
  telephone?: string
  email?: string
}

interface RendezVous {
  id: number
  date: string
  heure: string
  motif: string
  patient: Patient
  statut: string
  notes?: string
}

export default function MedecinRendezVousPage() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([])
  const [filteredRendezvous, setFilteredRendezvous] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")
  const [dateFilter, setDateFilter] = useState("tous")

  const fetchRdv = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/medecin/me/rendezvous", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      setRendezvous(data)
      setFilteredRendezvous(data)
    } catch (err) {
      console.error("Erreur chargement rendez-vous", err)
      toast.error("Impossible de charger les rendez-vous")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRdv()
  }, [])

  useEffect(() => {
    let filtered = rendezvous

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (rdv) =>
          `${rdv.patient.prenom} ${rdv.patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rdv.motif.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrage par statut
    if (statusFilter !== "tous") {
      filtered = filtered.filter((rdv) => rdv.statut === statusFilter)
    }

    // Filtrage par date
    if (dateFilter !== "tous") {
      const today = new Date()
      const rdvDate = new Date(filtered[0]?.date || today)

      switch (dateFilter) {
        case "aujourd'hui":
          filtered = filtered.filter((rdv) => {
            const date = new Date(rdv.date)
            return date.toDateString() === today.toDateString()
          })
          break
        case "cette-semaine":
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
          filtered = filtered.filter((rdv) => {
            const date = new Date(rdv.date)
            return date >= weekStart && date <= weekEnd
          })
          break
        case "ce-mois":
          filtered = filtered.filter((rdv) => {
            const date = new Date(rdv.date)
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
          })
          break
      }
    }

    setFilteredRendezvous(filtered)
  }, [searchTerm, statusFilter, dateFilter, rendezvous])

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "confirmé":
      case "confirme":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmé
          </Badge>
        )
      case "en attente":
      case "attente":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "annulé":
      case "annule":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Annulé
          </Badge>
        )
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    return date.toDateString() === today.toDateString()
  }

  const isUpcoming = (dateString: string, heure: string) => {
    const now = new Date()
    const rdvDateTime = new Date(`${dateString}T${heure}`)
    return rdvDateTime > now
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Rendez-vous</h1>
        <p className="text-gray-600">Gérez vos consultations et suivez vos patients</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{rendezvous.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold">{rendezvous.filter((rdv) => isToday(rdv.date)).length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("confirm")).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("attente")).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un patient ou un motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="confirmé">Confirmé</SelectItem>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les dates</SelectItem>
                <SelectItem value="aujourd'hui">Aujourd'hui</SelectItem>
                <SelectItem value="cette-semaine">Cette semaine</SelectItem>
                <SelectItem value="ce-mois">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      {filteredRendezvous.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== "tous" || dateFilter !== "tous"
                ? "Aucun rendez-vous trouvé"
                : "Aucun rendez-vous pour le moment"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "tous" || dateFilter !== "tous"
                ? "Essayez de modifier vos filtres de recherche"
                : "Vos prochains rendez-vous apparaîtront ici"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRendezvous.map((rdv) => (
            <Card
              key={rdv.id}
              className={`hover:shadow-lg transition-shadow ${
                isToday(rdv.date) ? "ring-2 ring-blue-200 bg-blue-50/30" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {rdv.patient.prenom} {rdv.patient.nom}
                      </CardTitle>
                      {isToday(rdv.date) && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Aujourd'hui
                        </Badge>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(rdv.statut)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(rdv.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{rdv.heure}</span>
                    {isUpcoming(rdv.date, rdv.heure) && (
                      <Badge variant="outline" className="text-xs ml-auto">
                        À venir
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Motif de consultation</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rdv.motif}</p>
                </div>

                {rdv.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rdv.notes}</p>
                  </div>
                )}

                {(rdv.patient.telephone || rdv.patient.email) && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div className="space-y-2">
                      {rdv.patient.telephone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{rdv.patient.telephone}</span>
                        </div>
                      )}
                      {rdv.patient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{rdv.patient.email}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Voir détails
                  </Button>
                  {rdv.statut.toLowerCase() === "en attente" && (
                    <Button size="sm" className="flex-1">
                      Confirmer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
