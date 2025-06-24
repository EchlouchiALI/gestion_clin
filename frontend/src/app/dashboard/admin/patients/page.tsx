"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Trash2, Mail, UserPlus, Search, User, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Patient {
  id: string
  nom: string
  prenom: string
  age: number
  lieuNaissance: string
  email: string
}

// Modal component avec nouveau style
function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <Button
  onClick={onClose}
  variant="ghost"
  className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
>
  ×
</Button>

          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState("")
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    lieuNaissance: "",
    email: "",
    password: "",
  })

  const filteredPatients = patients.filter(
    (p) =>
      (p.nom?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.prenom?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.email?.toLowerCase() ?? "").includes(search.toLowerCase()),
  )

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/admin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const deletePatient = async (id: string) => {
    if (!confirm("Supprimer ce patient ?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3001/admin/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients((prev) => prev.filter((p) => p.id !== id))
      toast.success("Patient supprimé")
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openMessageModal = (email: string) => {
    setSelectedEmail(email)
    setMessageModalOpen(true)
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:3001/admin/patients/message",
        {
          email: selectedEmail,
          content: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success(`Message envoyé à ${selectedEmail}`)
    } catch {
      toast.error("Erreur lors de l'envoi de l'email")
    }
    setMessageModalOpen(false)
    setMessage("")
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:3001/admin/patients", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Patient ajouté avec succès")
      setAddModalOpen(false)
      setFormData({ nom: "", prenom: "", age: "", lieuNaissance: "", email: "", password: "" })
      fetchPatients()
    } catch {
      toast.error("Erreur lors de l'ajout du patient")
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-pink-400 to-red-400",
      "from-blue-400 to-cyan-400",
      "from-green-400 to-emerald-400",
      "from-purple-400 to-indigo-400",
      "from-yellow-400 to-orange-400",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestion des Patients</h1>
              <p className="text-blue-100">Gérez facilement votre base de patients</p>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Nouveau Patient
            </Button>
          </div>
        </div>

        {/* Barre de recherche stylée */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Patients</p>
                <p className="text-3xl font-bold">{patients.length}</p>
              </div>
              <User className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Résultats</p>
                <p className="text-3xl font-bold">{filteredPatients.length}</p>
              </div>
              <Search className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Âge Moyen</p>
                <p className="text-3xl font-bold">
                  {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length) : 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun patient trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient, index) => (
              <div
                key={patient.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header coloré pour chaque carte */}
                <div className={`bg-gradient-to-r ${getGradientClass(index)} p-6`}>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">
                        {patient.prenom} {patient.nom}
                      </h3>
                      <p className="text-white/80 text-sm">ID: {patient.id}</p>
                    </div>
                  </div>
                </div>

                {/* Contenu détaillé de la carte */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* Informations personnelles */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        Informations personnelles
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom complet:</span>
                          <span className="font-medium text-gray-800">
  {patient.nom} {patient.prenom}
</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Âge:</span>
                          <span className="font-medium text-gray-800">
  {patient.age} ans
</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lieu de naissance:</span>
                          <span className="font-medium text-gray-800">
  {patient.lieuNaissance}
</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                        Contact
                      </h4>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Email:</span>
                          <span className="font-medium text-blue-600 break-all">{patient.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openMessageModal(patient.email)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl py-2"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>
                    <Button
                      onClick={() => deletePatient(patient.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl px-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de message */}
        {messageModalOpen && (
          <Modal title={`Message à ${selectedEmail}`} onClose={() => setMessageModalOpen(false)}>
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message ici..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none"
                rows={5}
              />
              <Button
                onClick={sendMessage}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 hover:from-blue-600 hover:to-purple-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer le message
              </Button>
            </div>
          </Modal>
        )}

        {/* Modal d'ajout */}
        {addModalOpen && (
          <Modal title="Ajouter un nouveau patient" onClose={() => setAddModalOpen(false)}>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <Input
                  placeholder="Prénom"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <Input
                  type="number"
                  placeholder="Âge"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <Input
                  placeholder="Lieu de naissance"
                  required
                  value={formData.lieuNaissance}
                  onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl py-3"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 hover:from-green-600 hover:to-emerald-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}
