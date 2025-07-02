"use client"

import { useEffect, useState } from "react"
import { User, Mail, Trash2, FileText, Pencil, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import PatientForm from "@/components/patient-form"
import DeleteConfirmation from "@/components/delete-confirmation"
import { MessageForm } from "@/components/message-form"
import type { Patient } from "@/types/patient"

export default function CleanPatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/medecin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPatients(data)
    } catch (err) {
      console.error("Erreur de récupération des patients", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token")
    await fetch(`http://localhost:3001/medecin/patients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchPatients()
    setShowDeleteModal(false)
  }

  const handlePatientSubmit = async (data: any) => {
    const token = localStorage.getItem("token")
    const isEdit = !!selectedPatient

    const payload = isEdit ? { ...data } : { ...data, password: data.password || "123456" }

    if (isEdit) delete payload.password

    const url = isEdit
      ? `http://localhost:3001/medecin/patients/${selectedPatient.id}`
      : `http://localhost:3001/medecin/patients`

    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("❌ Erreur backend :", errorText)
      return
    }

    setShowForm(false)
    fetchPatients()
  }

  const handleSendMessage = async (data: { subject: string; message: string }) => {
    const token = localStorage.getItem("token")
    if (!token || !selectedPatient) return

    await fetch(`http://localhost:3001/medecin/patients/${selectedPatient.id}/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    setShowMessageForm(false)
  }

  const handleGeneratePDF = async (patientId: number) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3001/medecin/patients/${patientId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("❌ Erreur génération PDF :", errorText)
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `patient-${patientId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
          </div>

          <Button
            onClick={() => {
              setSelectedPatient(null)
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Patient
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 text-lg border-0 bg-white shadow-md rounded-xl focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-200"
          />
        </div>

        {/* Patients Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Patients ({filteredPatients.length})</h2>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-500">Aucun patient trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden border border-gray-100"
                >
                  {/* Patient Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {patient.prenom} {patient.nom}
                        </h3>
                        <p className="text-blue-100 text-sm">Patient</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{patient.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Téléphone:</span>
                        <span className="text-sm font-medium text-gray-900">{patient.telephone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Sexe:</span>
                        <span className="text-sm font-medium text-gray-900">{patient.sexe}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Naissance:</span>
                        <span className="text-sm font-medium text-gray-900">{patient.dateNaissance}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient)
                          setShowForm(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-sm font-medium">Modifier</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPatient(patient)
                          setShowMessageForm(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Message</span>
                      </button>

                      <button
                        onClick={() => handleGeneratePDF(patient.id)}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPatient(patient)
                          setShowDeleteModal(true)
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showForm && (
          <PatientForm
            patient={selectedPatient ?? undefined}
            onSubmit={handlePatientSubmit}
            onClose={() => setShowForm(false)}
          />
        )}

        {showDeleteModal && selectedPatient && (
          <DeleteConfirmation
            title="Supprimer ce patient ?"
            message="Cette action est irréversible."
            onConfirm={() => handleDelete(selectedPatient.id)}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {showMessageForm && selectedPatient && (
          <MessageForm
            patient={selectedPatient}
            onSubmit={handleSendMessage}
            onClose={() => setShowMessageForm(false)}
          />
        )}
      </div>
    </div>
  )
}
