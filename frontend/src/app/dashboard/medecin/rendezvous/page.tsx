"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  User,
  Search,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

export default function RendezVousPrestige() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([])
  const [filteredRendezvous, setFilteredRendezvous] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")
  const [
    /* remove selectedRdv, isDetailOpen, newStatus, newNotes */
  ] = useState<RendezVous | null>(null)
  const [
    /* remove selectedRdv, isDetailOpen, newStatus, newNotes */
  ] = useState(false)
  const [
    /* remove selectedRdv, isDetailOpen, newStatus, newNotes */
  ] = useState("")
  const [
    /* remove selectedRdv, isDetailOpen, newStatus, newNotes */
  ] = useState("")

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

  const updateRendezVousStatus = async (id: number, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3001/rendezvous/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: status, notes }),
      })

      if (!res.ok) throw new Error("Erreur mise à jour")

      setRendezvous((prev) =>
        prev.map((rdv) => (rdv.id === id ? { ...rdv, statut: status, notes: notes || rdv.notes } : rdv)),
      )

      toast.success(`Rendez-vous ${status.toLowerCase()}`)
      /* remove setIsDetailOpen(false) */
    } catch (err) {
      console.error("Erreur mise à jour", err)
      toast.error("Impossible de mettre à jour le rendez-vous")
    }
  }

  useEffect(() => {
    fetchRdv()
  }, [])

  useEffect(() => {
    let filtered = rendezvous

    if (searchTerm) {
      filtered = filtered.filter(
        (rdv) =>
          `${rdv.patient.prenom} ${rdv.patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rdv.motif.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "tous") {
      filtered = filtered.filter((rdv) => rdv.statut.toLowerCase().includes(statusFilter.toLowerCase()))
    }

    setFilteredRendezvous(filtered)
  }, [searchTerm, statusFilter, rendezvous])

  const getStatusConfig = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "confirmé":
      case "confirme":
        return {
          color: "bg-emerald-500",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          icon: <CheckCircle className="w-5 h-5" />,
        }
      case "en attente":
      case "attente":
        return {
          color: "bg-amber-500",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: <AlertCircle className="w-5 h-5" />,
        }
      case "annulé":
      case "annule":
        return {
          color: "bg-red-500",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          icon: <XCircle className="w-5 h-5" />,
        }
      default:
        return {
          color: "bg-gray-500",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: <Clock className="w-5 h-5" />,
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    return date.toDateString() === today.toDateString()
  }

  /* remove openDetailModal function */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-16 w-80 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Prestigieux */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-white/50 hover:bg-white/80 border-slate-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Cabinet Médical
                </h1>
                <p className="text-slate-600 mt-1 text-lg">Gestion des rendez-vous</p>
              </div>
            </div>
            <Button
              onClick={fetchRdv}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques Élégantes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{rendezvous.length}</p>
                <p className="text-xs text-slate-500 mt-1">Rendez-vous</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Aujourd'hui</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {rendezvous.filter((rdv) => isToday(rdv.date)).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">En cours</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Confirmés</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("confirm")).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Validés</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">En attente</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("attente")).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">À traiter</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres Sophistiqués */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Rechercher un patient ou un motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/50 border-slate-200 focus:bg-white text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-3">
              {[
                { key: "tous", label: "Tous", color: "slate" },
                { key: "confirmé", label: "Confirmés", color: "emerald" },
                { key: "attente", label: "En attente", color: "amber" },
                { key: "annulé", label: "Annulés", color: "red" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={statusFilter === filter.key ? "default" : "outline"}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-6 py-2 font-medium transition-all duration-200 ${
                    statusFilter === filter.key
                      ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white shadow-lg`
                      : "bg-white/50 hover:bg-white/80 border-slate-200 text-slate-700"
                  }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des Rendez-vous Prestigieuse */}
        <div className="space-y-6">
          {filteredRendezvous.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
              <Calendar className="h-20 w-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Aucun rendez-vous trouvé</h3>
              <p className="text-slate-500 text-lg">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            filteredRendezvous.map((rdv) => {
              const statusConfig = getStatusConfig(rdv.statut)
              return (
                <div
                  key={rdv.id}
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                    isToday(rdv.date) ? "ring-2 ring-blue-400 ring-opacity-50" : ""
                  }`}
                >
                  {/* Header de la carte */}
                  <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-b px-8 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 ${statusConfig.color} rounded-full shadow-sm`}></div>
                        <div
                          className={`flex items-center space-x-2 px-3 py-1 ${statusConfig.bgColor} ${statusConfig.textColor} rounded-full border ${statusConfig.borderColor}`}
                        >
                          {statusConfig.icon}
                          <span className="font-semibold text-sm uppercase tracking-wide">{rdv.statut}</span>
                        </div>
                        {isToday(rdv.date) && (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm">Aujourd'hui</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">RDV #{rdv.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      {/* Informations patient */}
                      <div className="flex items-start space-x-6 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                          <User className="w-8 h-8 text-slate-600" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-800 mb-2">
                            {rdv.patient.prenom} {rdv.patient.nom}
                          </h3>

                          {/* Informations de contact */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-3 text-slate-600">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Date</p>
                                <p className="font-semibold">{formatDate(rdv.date)}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 text-slate-600">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Heure</p>
                                <p className="font-semibold">{formatTime(rdv.heure)}</p>
                              </div>
                            </div>

                            {rdv.patient.telephone && (
                              <div className="flex items-center space-x-3 text-slate-600">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-500">Téléphone</p>
                                  <p className="font-semibold">{rdv.patient.telephone}</p>
                                </div>
                              </div>
                            )}

                            {rdv.patient.email && (
                              <div className="flex items-center space-x-3 text-slate-600">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-500">Email</p>
                                  <p className="font-semibold">{rdv.patient.email}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Motif et notes */}
                          <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <div className="flex items-start space-x-3">
                              <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500 mb-1">Motif de consultation</p>
                                <p className="text-slate-800 font-medium">{rdv.motif}</p>
                                {rdv.notes && (
                                  <div className="mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 mb-1">Notes</p>
                                    <p className="text-slate-700">{rdv.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-3 ml-8">
                 <div className="flex flex-col space-y-2">
                  {rdv.statut !== "à venir" && (
      <Button
        onClick={() => updateRendezVousStatus(rdv.id, "à venir")}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
      >
        <Check className="w-4 h-4" />
        <span>Confirmer</span>
      </Button>
    )}

    {rdv.statut !== "passé" && (
      <Button
        onClick={() => updateRendezVousStatus(rdv.id, "passé")}
        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg"
      >
        <AlertCircle className="w-4 h-4" />
        <span>Marquer comme passé</span>
      </Button>
    )}

    {rdv.statut !== "annulé" && (
      <Button
        onClick={() => updateRendezVousStatus(rdv.id, "annulé")}
        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
      >
        <X className="w-4 h-4" />
        <span>Annuler</span>
      </Button>
    )}
  </div>
</div>

                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal de détails sophistiqué */}
        {/* Remove the entire Dialog component and its content at the bottom */}
      </div>
    </div>
  )
}
