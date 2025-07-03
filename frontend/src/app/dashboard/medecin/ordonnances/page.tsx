"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"
import { useEffect } from "react"
import { ArrowLeft, Plus, Trash2, FileText, Calendar, User, Stethoscope, Search, Edit, AlertCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Replace with:
import { useState } from "react"

type Medicament = {
  nom: string
  posologie: string
  mte?: boolean
  ar?: string
  qsp?: string
  nr?: boolean
}

type Ordonnance = {
  id: string
  patientNom: string
  patientAge?: string
  patientPoids?: string
  date: string
  medicaments: Medicament[]
  conseils: string
}

export default function PageOrdonnanceManuelle() {
  const [form, setForm] = useState({
    medecinNom: "Dr Lazrak Mohammed",
    medecinSpecialite: "Chirurgien généraliste",
    medecinAdresse: "Clinique Atlas",
    medecinDiplome: "",
    medecinTelephoneCabinet: "",
    medecinTelephoneUrgence: "",
    patientNom: "",
    patientAge: "",
    patientPoids: "",
    date: new Date().toISOString().split("T")[0],
    conseils: "",
  })

  const [medicaments, setMedicaments] = useState<Medicament[]>([])
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([])
  const [activeTab, setActiveTab] = useState("creation")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newMedicament, setNewMedicament] = useState<Medicament>({
    nom: "",
    posologie: "",
    mte: false,
    ar: "",
    qsp: "",
    nr: false,
  })

  // Add this state for notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Simuler le chargement des ordonnances existantes
  useEffect(() => {
    // Ici vous pourriez charger les ordonnances depuis votre API
    const mockOrdonnances: Ordonnance[] = [
      {
        id: "1",
        patientNom: "Ahmed Benali",
        patientAge: "45",
        patientPoids: "78",
        date: "2024-01-15",
        medicaments: [
          { nom: "Paracétamol", posologie: "500mg 3x/jour", mte: false },
          { nom: "Vitamine C", posologie: "1000mg 1x/jour", qsp: "30 jours" },
        ],
        conseils: "Repos et hydratation",
      },
      {
        id: "2",
        patientNom: "Fatima Alami",
        patientAge: "32",
        date: "2024-01-14",
        medicaments: [{ nom: "Amoxicilline", posologie: "1g 2x/jour", mte: true, qsp: "7 jours" }],
        conseils: "Prendre avec les repas",
      },
      {
        id: "3",
        patientNom: "Karim Idrissi",
        patientAge: "28",
        patientPoids: "65",
        date: "2024-01-10",
        medicaments: [
          { nom: "Ibuprofène", posologie: "400mg 3x/jour", nr: true },
          { nom: "Oméprazole", posologie: "20mg 1x/jour", qsp: "14 jours" },
        ],
        conseils: "Éviter l'alcool pendant le traitement",
      },
    ]
    setOrdonnances(mockOrdonnances)
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMedicament = () => {
    if (newMedicament.nom.trim() === "" || newMedicament.posologie.trim() === "") {
      setNotification({ message: "Le nom et la posologie du médicament sont obligatoires", type: "error" })
      return
    }

    setMedicaments((prev) => [...prev, newMedicament])
    setNewMedicament({ nom: "", posologie: "", mte: false, ar: "", qsp: "", nr: false })

    setNotification({ message: `${newMedicament.nom} a été ajouté à l'ordonnance`, type: "success" })
  }

  const handleRemoveMedicament = (index: number) => {
    const medicamentToRemove = medicaments[index]
    setMedicaments((prev) => prev.filter((_, i) => i !== index))

    setNotification({ message: `${medicamentToRemove.nom} a été retiré de l'ordonnance`, type: "success" })
  }

  const handleGeneratePDF = async () => {
    if (!form.patientNom || medicaments.length === 0) {
      setNotification({
        message: "Veuillez remplir le nom du patient et ajouter au moins un médicament",
        type: "error",
      })
      return
    }

    const payload = {
      ...form,
      medicaments,
    }

    try {
      // Simulation de l'appel API
      // const res = await fetch("http://localhost:3001/medecin/ordonnances/pdf-manuel", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      //   body: JSON.stringify(payload),
      // })
      // const blob = await res.blob()
      // const url = URL.createObjectURL(blob)
      // window.open(url, "_blank")

      // Simulation de la génération réussie
      setTimeout(() => {
        // Ajouter l'ordonnance à la liste après génération réussie
        const newOrdonnance: Ordonnance = {
          id: Date.now().toString(),
          patientNom: form.patientNom,
          patientAge: form.patientAge,
          patientPoids: form.patientPoids,
          date: form.date,
          medicaments: [...medicaments],
          conseils: form.conseils,
        }

        setOrdonnances((prev) => [newOrdonnance, ...prev])

        setNotification({
          message: `L'ordonnance pour ${form.patientNom} a été créée avec succès`,
          type: "success",
        })

        // Réinitialiser le formulaire
        setForm((prev) => ({
          ...prev,
          patientNom: "",
          patientAge: "",
          patientPoids: "",
          conseils: "",
          date: new Date().toISOString().split("T")[0],
        }))
        setMedicaments([])

        // Basculer vers l'onglet de liste
        setActiveTab("liste")
      }, 1000)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      setNotification({
        message: "Une erreur est survenue lors de la génération de l'ordonnance",
        type: "error",
      })
    }
  }

  const handleEditOrdonnance = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance)
    setForm({
      ...form,
      patientNom: ordonnance.patientNom,
      patientAge: ordonnance.patientAge || "",
      patientPoids: ordonnance.patientPoids || "",
      date: ordonnance.date,
      conseils: ordonnance.conseils,
    })
    setMedicaments([...ordonnance.medicaments])
    setIsEditMode(true)
    setActiveTab("creation")
  }

  const handleUpdateOrdonnance = () => {
    if (selectedOrdonnance) {
      const updatedOrdonnance: Ordonnance = {
        ...selectedOrdonnance,
        patientNom: form.patientNom,
        patientAge: form.patientAge,
        patientPoids: form.patientPoids,
        date: form.date,
        medicaments: [...medicaments],
        conseils: form.conseils,
      }

      setOrdonnances((prev) => prev.map((ord) => (ord.id === selectedOrdonnance.id ? updatedOrdonnance : ord)))

      setNotification({
        message: `L'ordonnance pour ${form.patientNom} a été modifiée avec succès`,
        type: "success",
      })

      // Réinitialiser
      setForm((prev) => ({
        ...prev,
        patientNom: "",
        patientAge: "",
        patientPoids: "",
        conseils: "",
        date: new Date().toISOString().split("T")[0],
      }))
      setMedicaments([])
      setSelectedOrdonnance(null)
      setIsEditMode(false)
      setActiveTab("liste")
    }
  }

  const handleDeleteOrdonnance = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteOrdonnance = () => {
    if (selectedOrdonnance) {
      setOrdonnances((prev) => prev.filter((ord) => ord.id !== selectedOrdonnance.id))
      setIsDeleteDialogOpen(false)
      setSelectedOrdonnance(null)

      setNotification({
        message: "L'ordonnance a été supprimée avec succès",
        type: "success",
      })
    }
  }

  const cancelEdit = () => {
    setForm((prev) => ({
      ...prev,
      patientNom: "",
      patientAge: "",
      patientPoids: "",
      conseils: "",
      date: new Date().toISOString().split("T")[0],
    }))
    setMedicaments([])
    setSelectedOrdonnance(null)
    setIsEditMode(false)
  }

  const filteredOrdonnances = ordonnances.filter(
    (ord) =>
      ord.patientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.medicaments.some((med) => med.nom.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleGoBack = () => {
    window.history.back()
  }

  // Replace the Tabs component usage with this custom implementation
  const TabButton = ({
    active,
    onClick,
    children,
  }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={`flex-1 ${active ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-200"}`}
    >
      {children}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setNotification(null)} className="ml-2 h-6 w-6 p-0">
                ×
              </Button>
            </div>
          </div>
        )}
        {/* Header avec navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2 bg-white shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Gestion des Ordonnances</h1>
              <p className="text-blue-600">Créez, modifiez et gérez vos ordonnances médicales</p>
            </div>
          </div>
        </div>

        {/* Tabs pour navigation */}
        <div className="w-full max-w-md mx-auto mb-6 flex">
          <TabButton active={activeTab === "creation"} onClick={() => setActiveTab("creation")}>
            {isEditMode ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
          </TabButton>
          <TabButton active={activeTab === "liste"} onClick={() => setActiveTab("liste")}>
            Liste des ordonnances
          </TabButton>
        </div>

        {/* Tab de création/modification */}
        {activeTab === "creation" && (
          <div className="space-y-6">
            {isEditMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-amber-800">
                    Vous modifiez l'ordonnance de <strong>{selectedOrdonnance?.patientNom}</strong> du{" "}
                    {selectedOrdonnance?.date}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  className="border-amber-300 text-amber-800 bg-transparent"
                >
                  Annuler la modification
                </Button>
              </div>
            )}

            {/* Informations Médecin */}
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  Informations Médecin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medecinNom" className="text-blue-700">
                      Nom du médecin
                    </Label>
                    <Input
                      id="medecinNom"
                      name="medecinNom"
                      value={form.medecinNom}
                      onChange={handleFormChange}
                      className="bg-blue-50/50 border-blue-200"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinSpecialite" className="text-blue-700">
                      Spécialité
                    </Label>
                    <Input
                      id="medecinSpecialite"
                      name="medecinSpecialite"
                      value={form.medecinSpecialite}
                      onChange={handleFormChange}
                      className="bg-blue-50/50 border-blue-200"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinAdresse" className="text-blue-700">
                      Adresse
                    </Label>
                    <Input
                      id="medecinAdresse"
                      name="medecinAdresse"
                      value={form.medecinAdresse}
                      onChange={handleFormChange}
                      className="bg-blue-50/50 border-blue-200"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinDiplome" className="text-blue-700">
                      Diplôme
                    </Label>
                    <Input
                      id="medecinDiplome"
                      name="medecinDiplome"
                      value={form.medecinDiplome}
                      onChange={handleFormChange}
                      placeholder="Diplôme (optionnel)"
                      className="border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinTelephoneCabinet" className="text-blue-700">
                      Téléphone cabinet
                    </Label>
                    <Input
                      id="medecinTelephoneCabinet"
                      name="medecinTelephoneCabinet"
                      value={form.medecinTelephoneCabinet}
                      onChange={handleFormChange}
                      placeholder="Téléphone cabinet"
                      className="border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinTelephoneUrgence" className="text-blue-700">
                      Téléphone urgences
                    </Label>
                    <Input
                      id="medecinTelephoneUrgence"
                      name="medecinTelephoneUrgence"
                      value={form.medecinTelephoneUrgence}
                      onChange={handleFormChange}
                      placeholder="Téléphone urgences"
                      className="border-blue-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations Patient */}
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="h-5 w-5 text-blue-600" />
                  Informations Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientNom" className="text-blue-700">
                      Nom du patient <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="patientNom"
                      name="patientNom"
                      value={form.patientNom}
                      onChange={handleFormChange}
                      placeholder="Nom complet du patient"
                      required
                      className="border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientAge" className="text-blue-700">
                      Âge
                    </Label>
                    <Input
                      id="patientAge"
                      name="patientAge"
                      value={form.patientAge}
                      onChange={handleFormChange}
                      placeholder="Âge"
                      className="border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPoids" className="text-blue-700">
                      Poids
                    </Label>
                    <Input
                      id="patientPoids"
                      name="patientPoids"
                      value={form.patientPoids}
                      onChange={handleFormChange}
                      placeholder="Poids (kg)"
                      className="border-blue-200"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date" className="text-blue-700">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-fit border-blue-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Médicaments */}
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Médicaments
                </CardTitle>
                <p className="text-sm text-blue-600 mt-1">Ajoutez les médicaments à prescrire au patient</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomMedicament" className="text-blue-700">
                        Nom du médicament <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomMedicament"
                        placeholder="Nom du médicament"
                        value={newMedicament.nom}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, nom: e.target.value }))}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="posologie" className="text-blue-700">
                        Posologie <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="posologie"
                        placeholder="Ex: 500mg 3x/jour"
                        value={newMedicament.posologie}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, posologie: e.target.value }))}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ar" className="text-blue-700">
                        AR
                      </Label>
                      <Input
                        id="ar"
                        placeholder="Autorisation de remboursement"
                        value={newMedicament.ar}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, ar: e.target.value }))}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qsp" className="text-blue-700">
                        QSP
                      </Label>
                      <Input
                        id="qsp"
                        placeholder="Quantité suffisante pour"
                        value={newMedicament.qsp}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, qsp: e.target.value }))}
                        className="border-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mte"
                        checked={newMedicament.mte}
                        onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, mte: !!v }))}
                      />
                      <Label htmlFor="mte" className="text-blue-700">
                        MTE (Médicament à Tarif Exceptionnel)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="nr"
                        checked={newMedicament.nr}
                        onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, nr: !!v }))}
                      />
                      <Label htmlFor="nr" className="text-blue-700">
                        NR (Non Remboursable)
                      </Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddMedicament}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter le médicament
                  </Button>
                </div>

                {medicaments.length > 0 && (
                  <div className="space-y-2 mt-6">
                    <Separator className="bg-blue-200" />
                    <h3 className="font-semibold text-blue-800">Médicaments ajoutés :</h3>
                    <div className="grid gap-3">
                      {medicaments.map((med, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-blue-900">{med.nom}</div>
                            <div className="text-sm text-blue-700">{med.posologie}</div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {med.mte && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                  MTE
                                </Badge>
                              )}
                              {med.ar && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  AR: {med.ar}
                                </Badge>
                              )}
                              {med.qsp && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  QSP: {med.qsp}
                                </Badge>
                              )}
                              {med.nr && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  NR
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveMedicament(i)}
                            className="ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Conseils au patient
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  name="conseils"
                  rows={4}
                  value={form.conseils}
                  onChange={handleFormChange}
                  placeholder="Conseils, recommandations, instructions particulières..."
                  className="resize-none border-blue-200"
                />
              </CardContent>
            </Card>

            {/* Bouton de génération */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={isEditMode ? handleUpdateOrdonnance : handleGeneratePDF}
                size="lg"
                className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
                disabled={!form.patientNom || medicaments.length === 0}
              >
                <FileText className="h-5 w-5 mr-2" />
                {isEditMode ? "Mettre à jour l'ordonnance" : "Générer l'ordonnance PDF"}
              </Button>
            </div>
          </div>
        )}

        {/* Tab de liste */}
        {activeTab === "liste" && (
          <div className="space-y-6">
            <Card className="shadow-md border-blue-100">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Liste des ordonnances
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 border-blue-200"
                      />
                    </div>
                    {/* Replace DropdownMenu with a simple button group */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-blue-200 bg-transparent">
                        Tous
                      </Button>
                      <Button variant="outline" size="sm" className="border-blue-200 bg-transparent">
                        Ce mois
                      </Button>
                      <Button variant="outline" size="sm" className="border-blue-200 bg-transparent">
                        Ce trimestre
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {filteredOrdonnances.length === 0 ? (
                  <div className="text-center py-12 bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
                    <FileText className="h-12 w-12 mx-auto text-blue-300 mb-3" />
                    <h3 className="text-lg font-medium text-blue-800 mb-1">Aucune ordonnance trouvée</h3>
                    <p className="text-blue-600">
                      {searchTerm
                        ? "Aucun résultat pour votre recherche"
                        : "Commencez par créer une nouvelle ordonnance"}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        className="mt-4 border-blue-200 bg-transparent"
                        onClick={() => setSearchTerm("")}
                      >
                        Effacer la recherche
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredOrdonnances.map((ord) => (
                      <Card key={ord.id} className="overflow-hidden border-blue-100">
                        <div className="flex flex-col md:flex-row">
                          <div className="flex-1 p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                              <h3 className="font-semibold text-lg text-blue-900">{ord.patientNom}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(ord.date).toLocaleDateString()}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {ord.medicaments.length} médicament{ord.medicaments.length > 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm text-blue-700">
                                <span className="font-medium">Médicaments:</span>{" "}
                                {ord.medicaments.map((m) => m.nom).join(", ")}
                              </div>
                              {ord.conseils && (
                                <div className="text-sm text-blue-700">
                                  <span className="font-medium">Conseils:</span> {ord.conseils}
                                </div>
                              )}
                              {(ord.patientAge || ord.patientPoids) && (
                                <div className="text-sm text-blue-700">
                                  <span className="font-medium">Patient:</span>
                                  {ord.patientAge && ` ${ord.patientAge} ans`}
                                  {ord.patientPoids && ` - ${ord.patientPoids} kg`}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex md:flex-col justify-evenly border-t md:border-t-0 md:border-l border-blue-100 bg-blue-50/50 p-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 border-blue-200 bg-transparent"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="hidden md:inline">Voir</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Ordonnance de {ord.patientNom}</DialogTitle>
                                  <DialogDescription>
                                    Créée le {new Date(ord.date).toLocaleDateString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-blue-800 mb-1">Patient</h4>
                                      <p>{ord.patientNom}</p>
                                      {ord.patientAge && <p>Âge: {ord.patientAge} ans</p>}
                                      {ord.patientPoids && <p>Poids: {ord.patientPoids} kg</p>}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-blue-800 mb-1">Médecin</h4>
                                      <p>{form.medecinNom}</p>
                                      <p>{form.medecinSpecialite}</p>
                                      <p>{form.medecinAdresse}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <h4 className="font-medium text-blue-800 mb-2">Médicaments prescrits</h4>
                                    <div className="space-y-2">
                                      {ord.medicaments.map((med, i) => (
                                        <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                          <div className="font-medium">{med.nom}</div>
                                          <div className="text-sm">{med.posologie}</div>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {med.mte && (
                                              <Badge
                                                variant="outline"
                                                className="bg-orange-100 text-orange-800 border-orange-200"
                                              >
                                                MTE
                                              </Badge>
                                            )}
                                            {med.ar && (
                                              <Badge
                                                variant="outline"
                                                className="bg-green-100 text-green-800 border-green-200"
                                              >
                                                AR: {med.ar}
                                              </Badge>
                                            )}
                                            {med.qsp && (
                                              <Badge
                                                variant="outline"
                                                className="bg-blue-100 text-blue-800 border-blue-200"
                                              >
                                                QSP: {med.qsp}
                                              </Badge>
                                            )}
                                            {med.nr && (
                                              <Badge
                                                variant="outline"
                                                className="bg-red-100 text-red-800 border-red-200"
                                              >
                                                NR
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {ord.conseils && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h4 className="font-medium text-blue-800 mb-2">Conseils</h4>
                                        <p className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                          {ord.conseils}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button className="bg-blue-600 hover:bg-blue-700">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Télécharger PDF
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-blue-200 mt-2 bg-transparent"
                              onClick={() => handleEditOrdonnance(ord)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden md:inline">Modifier</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 mt-2 bg-transparent"
                              onClick={() => handleDeleteOrdonnance(ord)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden md:inline">Supprimer</span>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="flex justify-between border-t border-blue-100 bg-blue-50/50 py-4 px-6">
                <div className="text-sm text-blue-700">
                  {filteredOrdonnances.length} ordonnance{filteredOrdonnances.length !== 1 ? "s" : ""} au total
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("creation")
                    setIsEditMode(false)
                    setSelectedOrdonnance(null)
                    setForm((prev) => ({
                      ...prev,
                      patientNom: "",
                      patientAge: "",
                      patientPoids: "",
                      conseils: "",
                      date: new Date().toISOString().split("T")[0],
                    }))
                    setMedicaments([])
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle ordonnance
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'ordonnance de {selectedOrdonnance?.patientNom} du{" "}
              {selectedOrdonnance?.date} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrdonnance} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
