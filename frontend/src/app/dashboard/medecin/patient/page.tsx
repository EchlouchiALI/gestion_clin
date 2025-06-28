"use client"

import { useEffect, useState } from "react"
import { Search, Users, Mail, AlertCircle, UserPlus, Edit, Trash2, MessageSquare, Phone, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Patient, CreatePatientData, UpdatePatientData } from "@/types/patient"
import { PatientForm } from "@/components/patient-form"
import { MessageForm } from "@/components/message-form"
import { DeleteConfirmation } from "@/components/delete-confirmation"

type ModalType = "add" | "edit" | "delete" | "message" | null

export default function PageGestionPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // API Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Aucun token trouvé")

      const res = await fetch("http://localhost:3001/medecin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)

      const data = await res.json()
      if (!Array.isArray(data)) throw new Error("Format de réponse invalide")

      setPatients(data)
      setFilteredPatients(data)
      setError(null)
    } catch (err: any) {
      console.error("Erreur de chargement des patients:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPatient = async (patientData: CreatePatientData) => {
    try {
      setActionLoading(true)
      const res = await fetch("http://localhost:3001/medecin/patients", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)

      const newPatient = await res.json()
      setPatients((prev) => [...prev, newPatient])
      setModalType(null)

      // Show success message
      alert("Patient ajouté avec succès!")
    } catch (err: any) {
      console.error("Erreur lors de l'ajout:", err)
      alert(`Erreur lors de l'ajout: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const updatePatient = async (data: CreatePatientData | UpdatePatientData) => {
    if (!("id" in data)) {
      throw new Error("Impossible de mettre à jour un patient sans ID.")
    }
  
    try {
      setActionLoading(true)
      const res = await fetch(`http://localhost:3001/medecin/patients/${data.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
  
      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)
  
      const updated = await res.json()
      setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setModalType(null)
      setSelectedPatient(null)
      alert("Patient modifié avec succès !")
    } catch (err: any) {
      console.error("Erreur lors de la modification :", err)
      alert(`Erreur : ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }
  

  const deletePatient = async (patientId: number) => {
    try {
      setActionLoading(true)
      const res = await fetch(`http://localhost:3001/medecin/patients/${patientId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)

      setPatients((prev) => prev.filter((p) => p.id !== patientId))
      setModalType(null)
      setSelectedPatient(null)

      alert("Patient supprimé avec succès!")
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err)
      alert(`Erreur lors de la suppression: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const sendMessage = async (messageData: { subject: string; message: string }) => {
    try {
      setActionLoading(true)
      const res = await fetch(`http://localhost:3001/medecin/patients/${selectedPatient?.id}/message`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)

      setModalType(null)
      setSelectedPatient(null)

      alert("Message envoyé avec succès!")
    } catch (err: any) {
      console.error("Erreur lors de l'envoi:", err)
      alert(`Erreur lors de l'envoi: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.telephone && patient.telephone.includes(searchTerm)),
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  // Event Handlers
  const handleRetry = () => {
    setError(null)
    fetchPatients()
  }

  const openModal = (type: ModalType, patient?: Patient) => {
    setModalType(type)
    setSelectedPatient(patient || null)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedPatient(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non renseigné"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Loading State
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Erreur: {error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Réessayer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Patients</h1>
        </div>
        <p className="text-muted-foreground">Gérez et consultez la liste de vos patients</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => openModal("add")} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter un patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total patients</span>
            </div>
            <p className="text-2xl font-bold">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Résultats</span>
            </div>
            <p className="text-2xl font-bold">{filteredPatients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avec email</span>
            </div>
            <p className="text-2xl font-bold">{patients.filter((p) => p.email).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avec téléphone</span>
            </div>
            <p className="text-2xl font-bold">{patients.filter((p) => p.telephone).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{searchTerm ? "Aucun patient trouvé" : "Aucun patient"}</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Essayez de modifier votre recherche" : "Commencez par ajouter votre premier patient"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Effacer la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {patient.prenom} {patient.nom}
                </CardTitle>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {patient.email}
                  </div>
                  {patient.telephone && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.telephone}
                    </div>
                  )}
                  {patient.dateNaissance && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(patient.dateNaissance)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">ID: {patient.id}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openModal("edit", patient)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openModal("message", patient)} className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("delete", patient)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {modalType === "add" && (
              <PatientForm onSubmit={createPatient} onCancel={closeModal} isLoading={actionLoading} />
            )}
            {modalType === "edit" && selectedPatient && (
              <PatientForm
                patient={selectedPatient}
                onSubmit={updatePatient}
                onCancel={closeModal}
                isLoading={actionLoading}
              />
            )}
            {modalType === "delete" && selectedPatient && (
              <DeleteConfirmation
                patient={selectedPatient}
                onConfirm={() => deletePatient(selectedPatient.id)}
                onCancel={closeModal}
                isLoading={actionLoading}
              />
            )}
            {modalType === "message" && selectedPatient && (
              <MessageForm
                patient={selectedPatient}
                onSubmit={sendMessage}
                onCancel={closeModal}
                isLoading={actionLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
