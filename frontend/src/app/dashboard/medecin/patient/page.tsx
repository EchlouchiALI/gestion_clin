'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Trash2, FileText, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PatientForm from '@/components/patient-form'
import DeleteConfirmation from '@/components/delete-confirmation'
import { MessageForm } from '@/components/message-form'
import type { Patient } from '@/types/patient'

export default function PageGestionPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3001/medecin/patients', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      setPatients(data)
    } catch (err) {
      console.error('Erreur de récupération des patients', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:3001/medecin/patients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchPatients()
    setShowDeleteModal(false)
  }

  const handlePatientSubmit = async (data: any) => {
    const token = localStorage.getItem('token')
    const isEdit = !!selectedPatient

    const payload = isEdit
      ? { ...data }
      : { ...data, password: data.password || '123456' }

    if (isEdit) delete payload.password

    const url = isEdit
      ? `http://localhost:3001/medecin/patients/${selectedPatient.id}`
      : `http://localhost:3001/medecin/patients`

    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Erreur backend :', errorText)
      return
    }

    setShowForm(false)
    fetchPatients()
  }

  const handleSendMessage = async (data: { subject: string; message: string }) => {
    const token = localStorage.getItem('token')
    if (!token || !selectedPatient) return

    await fetch(`http://localhost:3001/medecin/patients/${selectedPatient.id}/message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    setShowMessageForm(false)
  }

  const handleGeneratePDF = async (patientId: number) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:3001/medecin/patients/${patientId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Erreur génération PDF :', errorText)
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `patient-${patientId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Mes patients</h1>

      <Button onClick={() => {
        setSelectedPatient(null)
        setShowForm(true)
      }}>
        Ajouter un patient
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {patient.prenom} {patient.nom}
                </h2>
                <User className="w-5 h-5" />
              </div>
              <p>Email : {patient.email}</p>
              <p>Téléphone : {patient.telephone}</p>
              <p>Sexe : {patient.sexe}</p>
              <p>Date de naissance : {patient.dateNaissance}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPatient(patient)
                    setShowForm(true)
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Modifier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedPatient(patient)
                    setShowDeleteModal(true)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPatient(patient)
                    setShowMessageForm(true)
                  }}
                >
                  <Mail className="w-4 h-4 mr-1" /> Contacter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGeneratePDF(patient.id)}
                >
                  <FileText className="w-4 h-4 mr-1" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
  )
}
