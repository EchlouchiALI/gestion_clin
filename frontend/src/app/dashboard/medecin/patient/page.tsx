"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pencil,
  Trash2,
  FileDown,
  PlusCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  User,
  Search,
  AlertCircle,
} from "lucide-react"

interface Patient {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
  createdAt?: string
}

interface PatientForm {
  nom: string
  prenom: string
  email: string
  telephone: string
  sexe: string
  dateNaissance: string
}

// Simple toast function
const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
  if (variant === "destructive") {
    alert(`❌ ${title}: ${description}`)
  } else {
    alert(`✅ ${title}: ${description}`)
  }
}

export default function PageGestionPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [contactMessage, setContactMessage] = useState("")

  const [form, setForm] = useState<PatientForm>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "Homme",
    dateNaissance: "",
  })

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      sexe: "Homme",
      dateNaissance: "",
    })
  }

  const fetchPatients = async () => {
    if (!token) {
      router.push("/login")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("http://localhost:3001/medecin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur lors du chargement")

      const data = await res.json()
      setPatients(data)
    } catch (err) {
      console.error(err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const validateForm = (formData: PatientForm): boolean => {
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Nom, prénom et email sont obligatoires",
        variant: "destructive",
      })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erreur de validation",
        description: "Format d'email invalide",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleCreate = async () => {
    if (!validateForm(form)) return

    try {
      const res = await fetch("http://localhost:3001/medecin/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Erreur lors de la création")

      toast({
        title: "Succès",
        description: "Patient ajouté avec succès",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchPatients()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le patient",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setForm({
      nom: patient.nom,
      prenom: patient.prenom,
      email: patient.email,
      telephone: patient.telephone,
      sexe: patient.sexe,
      dateNaissance: patient.dateNaissance,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedPatient || !validateForm(form)) return

    try {
      const res = await fetch(`http://localhost:3001/medecin/patients/${selectedPatient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Erreur lors de la modification")

      toast({
        title: "Succès",
        description: "Patient modifié avec succès",
      })

      resetForm()
      setIsEditDialogOpen(false)
      setSelectedPatient(null)
      fetchPatients()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le patient",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Confirmer la suppression de ${patient.prenom} ${patient.nom} ?`)) return

    try {
      const res = await fetch(`http://localhost:3001/medecin/patients/${patient.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur lors de la suppression")

      toast({
        title: "Succès",
        description: "Patient supprimé avec succès",
      })

      fetchPatients()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le patient",
        variant: "destructive",
      })
    }
  }

  const handleContact = (patient: Patient) => {
    setSelectedPatient(patient)
    setContactMessage("")
    setIsContactDialogOpen(true)
  }

  const handleSendMessage = async () => {
    if (!selectedPatient || !contactMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message",
        variant: "destructive",
      })
      return
    }
  
    try {
      const res = await fetch(`http://localhost:3001/medecin/patients/${selectedPatient.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: contactMessage }),
      })
  
      if (!res.ok) throw new Error("Erreur lors de l'envoi")
  
      toast({
        title: "Succès",
        description: "Message envoyé avec succès",
      })
  
      setContactMessage("")
      setIsContactDialogOpen(false)
      setSelectedPatient(null)
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })
    }
  }
  

  const handleDownloadPdf = async (patient: Patient) => {
    try {
      const res = await fetch(`http://localhost:3001/medecin/patients/${patient.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Erreur lors du téléchargement")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `patient-${patient.prenom}-${patient.nom}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      })
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive",
      })
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateAge = (dateNaissance: string): number => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
          </div>
          <p className="text-gray-600">Gérez vos patients et leurs informations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hommes</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter((p) => p.sexe === "Homme").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Femmes</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter((p) => p.sexe === "Femme").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Ajouter un patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouveau Patient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                          id="nom"
                          value={form.nom}
                          onChange={(e) => setForm({ ...form, nom: e.target.value })}
                          placeholder="Nom de famille"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prenom">Prénom *</Label>
                        <Input
                          id="prenom"
                          value={form.prenom}
                          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                          placeholder="Prénom"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@exemple.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={form.telephone}
                        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                        placeholder="06 12 34 56 78"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sexe">Sexe</Label>
                        <Select value={form.sexe} onValueChange={(value) => setForm({ ...form, sexe: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homme">Homme</SelectItem>
                            <SelectItem value="Femme">Femme</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateNaissance">Date de naissance</Label>
                        <Input
                          id="dateNaissance"
                          type="date"
                          value={form.dateNaissance}
                          onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Patients ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Chargement...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "Aucun patient trouvé pour cette recherche" : "Aucun patient enregistré"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <Card key={patient.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patient.prenom} {patient.nom}
                            </h3>
                            <Badge variant={patient.sexe === "Homme" ? "default" : "secondary"}>{patient.sexe}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{patient.email}</span>
                            </div>
                            {patient.telephone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{patient.telephone}</span>
                              </div>
                            )}
                            {patient.dateNaissance && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{calculateAge(patient.dateNaissance)} ans</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(patient)}
                            className="hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContact(patient)}
                            className="hover:bg-green-50"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPdf(patient)}
                            className="hover:bg-purple-50"
                          >
                            <FileDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(patient)}
                            className="hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom">Nom *</Label>
                  <Input id="edit-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="edit-prenom">Prénom *</Label>
                  <Input
                    id="edit-prenom"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sexe">Sexe</Label>
                  <Select value={form.sexe} onValueChange={(value) => setForm({ ...form, sexe: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homme">Homme</SelectItem>
                      <SelectItem value="Femme">Femme</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-dateNaissance">Date de naissance</Label>
                  <Input
                    id="edit-dateNaissance"
                    type="date"
                    value={form.dateNaissance}
                    onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                  Mettre à jour
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contacter le Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Envoyez un message à {selectedPatient?.prenom} {selectedPatient?.nom}
              </p>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tapez votre message ici..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
