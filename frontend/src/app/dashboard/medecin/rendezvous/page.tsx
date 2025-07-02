"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, User, Search, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
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

export default function CleanRendezVousPage() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([])
  const [filteredRendezvous, setFilteredRendezvous] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("tous")

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
      filtered = filtered.filter((rdv) => rdv.statut.toLowerCase().includes(statusFilter.toLowerCase()))
    }

    setFilteredRendezvous(filtered)
  }, [searchTerm, statusFilter, rendezvous])

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "confirmé":
      case "confirme":
        return "bg-green-100 text-green-800"
      case "en attente":
      case "attente":
        return "bg-yellow-100 text-yellow-800"
      case "annulé":
      case "annule":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "confirmé":
      case "confirme":
        return <CheckCircle className="w-4 h-4" />
      case "en attente":
      case "attente":
        return <AlertCircle className="w-4 h-4" />
      case "annulé":
      case "annule":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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

  const isToday = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    return date.toDateString() === today.toDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{rendezvous.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rendezvous.filter((rdv) => isToday(rdv.date)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("confirm")).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rendezvous.filter((rdv) => rdv.statut.toLowerCase().includes("attente")).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un patient ou un motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("tous")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === "tous" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter("confirmé")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === "confirmé"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Confirmés
              </button>
              <button
                onClick={() => setStatusFilter("attente")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === "attente"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                En attente
              </button>
            </div>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Rendez-vous ({filteredRendezvous.length})</h2>
          </div>

          {filteredRendezvous.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRendezvous.map((rdv) => (
                <div
                  key={rdv.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isToday(rdv.date) ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Informations patient */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rdv.patient.prenom} {rdv.patient.nom}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(rdv.date)}</span>
                            {isToday(rdv.date) && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{rdv.heure}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Motif:</strong> {rdv.motif}
                          </p>
                          {rdv.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Notes:</strong> {rdv.notes}
                            </p>
                          )}
                        </div>
                        {(rdv.patient.telephone || rdv.patient.email) && (
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {rdv.patient.telephone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{rdv.patient.telephone}</span>
                              </div>
                            )}
                            {rdv.patient.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{rdv.patient.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statut et actions */}
                    <div className="flex flex-col items-end space-y-3">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rdv.statut)}`}
                      >
                        {getStatusIcon(rdv.statut)}
                        <span>{rdv.statut}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          Voir détails
                        </button>
                        {rdv.statut.toLowerCase().includes("attente") && (
                          <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Confirmer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
