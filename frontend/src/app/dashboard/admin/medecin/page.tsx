"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Trash2, Mail, UserPlus, Search, Calendar, Stethoscope, Phone, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Medecin {
  id: number
  nom: string
  prenom: string
  email: string
  specialite?: string
  telephone?: string
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
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0">
              ×
            </Button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function MedecinsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState("")
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    specialite: "",
    telephone: "",
  })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMedecin, setEditingMedecin] = useState<Medecin | null>(null)
  const [editFormData, setEditFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    specialite: "",
    telephone: "",
  })

  const filteredMedecins = medecins.filter(
    (m) =>
      (m.nom?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (m.prenom?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (m.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (m.specialite?.toLowerCase() ?? "").includes(search.toLowerCase()),
  )

  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3001/admin/medecins", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedecins(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const deleteMedecin = async (id: number) => {
    if (!confirm("Supprimer ce médecin ?")) return
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3001/admin/medecins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMedecins((prev) => prev.filter((m) => m.id !== id))
      toast.success("Médecin supprimé")
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
        "http://localhost:3001/admin/medecins/message",
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

  const handleAddMedecin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:3001/admin/medecins", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Médecin ajouté avec succès")
      setAddModalOpen(false)
      setFormData({ nom: "", prenom: "", email: "", specialite: "", telephone: "" })
      fetchMedecins()
    } catch {
      toast.error("Erreur lors de l'ajout du médecin")
    }
  }

  const openEditModal = (medecin: Medecin) => {
    setEditingMedecin(medecin)
    setEditFormData({
      nom: medecin.nom,
      prenom: medecin.prenom,
      email: medecin.email,
      specialite: medecin.specialite || "",
      telephone: medecin.telephone || "",
    })
    setEditModalOpen(true)
  }

  const handleEditMedecin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedecin) return

    try {
      const token = localStorage.getItem("token")
      await axios.put(`http://localhost:3001/admin/medecins/${editingMedecin.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Médecin modifié avec succès")
      setEditModalOpen(false)
      setEditingMedecin(null)
      setEditFormData({ nom: "", prenom: "", email: "", specialite: "", telephone: "" })
      fetchMedecins()
    } catch {
      toast.error("Erreur lors de la modification du médecin")
    }
  }

  useEffect(() => {
    fetchMedecins()
  }, [])

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-emerald-400 to-teal-400",
      "from-blue-400 to-indigo-400",
      "from-purple-400 to-pink-400",
      "from-green-400 to-emerald-400",
      "from-cyan-400 to-blue-400",
    ]
    return gradients[index % gradients.length]
  }

  const getSpecialiteCount = () => {
    const specialites = medecins.filter((m) => m.specialite).map((m) => m.specialite)
    return new Set(specialites).size
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <div className="p-8">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestion des Médecins</h1>
              <p className="text-green-100">Gérez facilement votre équipe médicale</p>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-3"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Nouveau Médecin
            </Button>
          </div>
        </div>

        {/* Barre de recherche stylée */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un médecin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:border-green-400 focus:ring-4 focus:ring-green-100"
          />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Médecins</p>
                <p className="text-3xl font-bold">{medecins.length}</p>
              </div>
              <Stethoscope className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100">Résultats</p>
                <p className="text-3xl font-bold">{filteredMedecins.length}</p>
              </div>
              <Search className="w-12 h-12 text-teal-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Spécialités</p>
                <p className="text-3xl font-bold">{getSpecialiteCount()}</p>
              </div>
              <Calendar className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredMedecins.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun médecin trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedecins.map((medecin, index) => (
              <div
                key={medecin.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Header coloré pour chaque carte */}
                <div className={`bg-gradient-to-r ${getGradientClass(index)} p-6`}>
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">
                        Dr. {medecin.prenom} {medecin.nom}
                      </h3>
                      <p className="text-white/80 text-sm">ID: {medecin.id}</p>
                    </div>
                  </div>
                </div>

                {/* Contenu détaillé de la carte */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* Informations professionnelles */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Stethoscope className="w-4 h-4 mr-2 text-green-500" />
                        Informations professionnelles
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom complet:</span>
                          <span className="font-medium text-gray-800">
                            Dr. {medecin.nom} {medecin.prenom}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Spécialité:</span>
                          <span className="font-medium text-gray-800">{medecin.specialite || "Non spécifiée"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-500" />
                        Contact
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">Email:</span>
                          <span className="font-medium text-blue-600 break-all">{medecin.email}</span>
                        </div>
                        {medecin.telephone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            <span className="text-gray-600 mr-2">Téléphone:</span>
                            <span className="font-medium text-gray-800">{medecin.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditModal(medecin)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl py-2"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => openMessageModal(medecin.email)}
                      className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-xl py-2"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      onClick={() => deleteMedecin(medecin.id)}
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
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100 resize-none"
                rows={5}
              />
              <Button
                onClick={sendMessage}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl py-3 hover:from-green-600 hover:to-teal-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer le message
              </Button>
            </div>
          </Modal>
        )}

        {/* Modal d'ajout */}
        {addModalOpen && (
          <Modal title="Ajouter un nouveau médecin" onClose={() => setAddModalOpen(false)}>
            <form onSubmit={handleAddMedecin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100"
                />
                <Input
                  placeholder="Prénom"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100"
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
              <Input
                placeholder="Spécialité (optionnel)"
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100"
              />
              <Input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100"
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

        {/* Modal d'édition */}
        {editModalOpen && editingMedecin && (
          <Modal
            title={`Modifier Dr. ${editingMedecin.prenom} ${editingMedecin.nom}`}
            onClose={() => setEditModalOpen(false)}
          >
            <form onSubmit={handleEditMedecin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nom"
                  required
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <Input
                  placeholder="Prénom"
                  required
                  value={editFormData.prenom}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                required
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <Input
                placeholder="Spécialité (optionnel)"
                value={editFormData.specialite}
                onChange={(e) => setEditFormData({ ...editFormData, specialite: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <Input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={editFormData.telephone}
                onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                className="border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl py-3"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}
