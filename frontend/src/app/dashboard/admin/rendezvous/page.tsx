"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Trash2,
  CalendarIcon,
  Search,
  Clock,
  User,
  Stethoscope,
  FileText,
  Plus,
  Filter,
  Edit,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"

interface Patient {
  id?: number
  nom: string
  prenom: string
  email: string
}

interface Medecin {
  id?: number
  nom: string
  prenom: string
  specialite?: string
}

interface RendezVous {
  id: number
  date: string
  heure: string
  motif: string
  statut: "à venir" | "passé" | "annulé"
  patient: Patient
  medecin: Medecin
}

export default function AdminRendezVousPage() {
  const router = useRouter()
  const [rendezvousList, setRendezvousList] = useState<RendezVous[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [search, setSearch] = useState("")
  const [statutFilter, setStatutFilter] = useState<"all" | "à venir" | "passé" | "annulé">("all")
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState({
    patientId: "",
    medecinId: "",
    motif: "",
  })
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingRdv, setEditingRdv] = useState<RendezVous | null>(null)
  const [editSelectedDate, setEditSelectedDate] = useState<Date>()
  const [editSelectedTime, setEditSelectedTime] = useState("")
  const [editFormData, setEditFormData] = useState({
    patientId: "",
    medecinId: "",
    motif: "",
  })

  // Générer les créneaux horaires de 8h à 18h par intervalles de 30 minutes
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const fetchRendezvous = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/rendezvous/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const sorted = res.data.sort(
        (a: RendezVous, b: RendezVous) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setRendezvousList(sorted)
    } catch (err) {
      console.error("Erreur chargement rendez-vous", err)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/admin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(res.data)
    } catch (err) {
      console.error("Erreur chargement patients", err)
      toast.error("Impossible de charger les patients")
    }
  }

  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/admin/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedecins(res.data)
    } catch (err) {
      console.error("Erreur chargement médecins", err)
      toast.error("Erreur chargement médecins")
    }
  }

  const deleteRendezvous = async (id: number) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3001/rendezvous/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Rendez-vous supprimé")
      fetchRendezvous()
    } catch (err) {
      console.error("Erreur suppression rendez-vous", err)
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleAddRendezVous = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et une heure")
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:3001/rendezvous/admin",
        {
          patientId: Number.parseInt(formData.patientId),
          medecinId: Number.parseInt(formData.medecinId),
          date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
          heure: selectedTime,
          motif: formData.motif,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      toast.success("Rendez-vous ajouté avec succès")
      setShowAddForm(false)
      setFormData({ patientId: "", medecinId: "", motif: "" })
      setSelectedDate(undefined)
      setSelectedTime("")
      fetchRendezvous()
    } catch (err) {
      console.error("Erreur ajout rendez-vous :", err)
      toast.error("Erreur lors de l'ajout du rendez-vous")
    }
  }

  const handleEditRendezVous = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRdv || !editSelectedDate || !editSelectedTime) return

    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:3001/rendezvous/admin/${editingRdv.id}`,
        {
          patientId: Number.parseInt(editFormData.patientId),
          medecinId: Number.parseInt(editFormData.medecinId),
          date: editSelectedDate ? editSelectedDate.toISOString().split("T")[0] : "",
          heure: editSelectedTime,
          motif: editFormData.motif,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      toast.success("Rendez-vous modifié avec succès")
      setShowEditForm(false)
      setEditingRdv(null)
      setEditFormData({ patientId: "", medecinId: "", motif: "" })
      setEditSelectedDate(undefined)
      setEditSelectedTime("")
      fetchRendezvous()
    } catch (err) {
      console.error("Erreur modification rendez-vous :", err)
      toast.error("Erreur lors de la modification du rendez-vous")
    }
  }

  const openEditForm = (rdv: RendezVous) => {
    setEditingRdv(rdv)
    setEditFormData({
      patientId: rdv.patient.id?.toString() || "",
      medecinId: rdv.medecin.id?.toString() || "",
      motif: rdv.motif,
    })
    setEditSelectedDate(new Date(rdv.date))
    setEditSelectedTime(rdv.heure)
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setShowEditForm(false)
    setEditingRdv(null)
    setEditFormData({ patientId: "", medecinId: "", motif: "" })
    setEditSelectedDate(undefined)
    setEditSelectedTime("")
  }

  const handleGoBack = () => {
    router.back()
  }

  useEffect(() => {
    fetchRendezvous()
    fetchPatients()
    fetchMedecins()
  }, [])

  const filteredList = rendezvousList.filter((rdv) => {
    const fullText = `${rdv.patient.nom} ${rdv.patient.prenom} ${rdv.medecin.nom} ${rdv.medecin.prenom}`.toLowerCase()
    const matchSearch = fullText.includes(search.toLowerCase())
    const matchStatut = statutFilter === "all" || rdv.statut === statutFilter
    return matchSearch && matchStatut
  })

  const stats = {
    total: rendezvousList.length,
    avenir: rendezvousList.filter((r) => r.statut === "à venir").length,
    passe: rendezvousList.filter((r) => r.statut === "passé").length,
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "à venir":
        return "bg-green-500 text-white"
      case "passé":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Barre de retour */}
      <div className="mb-4">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rendez-vous</h1>
            <p className="text-gray-600">Gérez tous les rendez-vous de votre cabinet</p>
          </div>
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm)
              if (showEditForm) {
                cancelEdit()
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Annuler" : "Nouveau RDV"}
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">À venir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avenir}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passe}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annulés</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout avec calendrier */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouveau rendez-vous</h2>
          <form onSubmit={handleAddRendezVous} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médecin</label>
                <select
                  required
                  value={formData.medecinId}
                  onChange={(e) => setFormData({ ...formData, medecinId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sélection de date et heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date du rendez-vous</label>
                <Input
                  type="date"
                  required
                  value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <select
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une heure</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
              <Input
                required
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                placeholder="Motif du rendez-vous"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                Ajouter
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Formulaire de modification avec calendrier */}
      {showEditForm && editingRdv && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Modifier le rendez-vous #{editingRdv.id}</h2>
          <form onSubmit={handleEditRendezVous} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  required
                  value={editFormData.patientId}
                  onChange={(e) => setEditFormData({ ...editFormData, patientId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.prenom} {patient.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médecin</label>
                <select
                  required
                  value={editFormData.medecinId}
                  onChange={(e) => setEditFormData({ ...editFormData, medecinId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sélection de date et heure pour modification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date du rendez-vous</label>
                <Input
                  type="date"
                  required
                  value={editSelectedDate ? editSelectedDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => setEditSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <select
                  required
                  value={editSelectedTime}
                  onChange={(e) => setEditSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Sélectionner une heure</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
              <Input
                required
                value={editFormData.motif}
                onChange={(e) => setEditFormData({ ...editFormData, motif: e.target.value })}
                placeholder="Motif du rendez-vous"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md">
                Modifier
              </Button>
              <Button
                type="button"
                onClick={cancelEdit}
                variant="outline"
                className="px-4 py-2 rounded-md bg-transparent"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un patient ou médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous</option>
              <option value="à venir">À venir</option>
              <option value="passé">Passé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun rendez-vous trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Patient</th>
                  <th className="text-left p-4 font-medium text-gray-900">Médecin</th>
                  <th className="text-left p-4 font-medium text-gray-900">Date & Heure</th>
                  <th className="text-left p-4 font-medium text-gray-900">Motif</th>
                  <th className="text-left p-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((rdv) => (
                  <tr key={rdv.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {rdv.patient.prenom} {rdv.patient.nom}
                          </p>
                          <p className="text-sm text-gray-500">{rdv.patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <Stethoscope className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {rdv.medecin.prenom} {rdv.medecin.nom}
                          </p>
                          {rdv.medecin.specialite && <p className="text-sm text-gray-500">{rdv.medecin.specialite}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{rdv.date}</p>
                          <p className="text-sm text-gray-500">{rdv.heure}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900">{rdv.motif}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutBadge(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(`http://localhost:3001/rendezvous/${rdv.id}/pdf`, "_blank")}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm"
                        >
                          PDF
                        </Button>
                        <Button
                          onClick={() => openEditForm(rdv)}
                          className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded text-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteRendezvous(rdv.id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
