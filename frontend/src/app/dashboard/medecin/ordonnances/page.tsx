"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, FileText, Calendar, User, Stethoscope } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
  const [showOrdonnancesList, setShowOrdonnancesList] = useState(false)

  const [newMedicament, setNewMedicament] = useState<Medicament>({
    nom: "",
    posologie: "",
    mte: false,
    ar: "",
    qsp: "",
    nr: false,
  })

  // Simuler le chargement des ordonnances existantes
  useEffect(() => {
    // Ici vous pourriez charger les ordonnances depuis votre API
    const mockOrdonnances: Ordonnance[] = [
      {
        id: "1",
        patientNom: "Ahmed Benali",
        date: "2024-01-15",
        medicaments: [{ nom: "Paracétamol", posologie: "500mg 3x/jour", mte: false }],
        conseils: "Repos et hydratation",
      },
      {
        id: "2",
        patientNom: "Fatima Alami",
        date: "2024-01-14",
        medicaments: [{ nom: "Amoxicilline", posologie: "1g 2x/jour", mte: true, qsp: "7 jours" }],
        conseils: "Prendre avec les repas",
      },
    ]
    setOrdonnances(mockOrdonnances)
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMedicament = () => {
    if (newMedicament.nom.trim() === "" || newMedicament.posologie.trim() === "") return

    setMedicaments((prev) => [...prev, newMedicament])
    setNewMedicament({ nom: "", posologie: "", mte: false, ar: "", qsp: "", nr: false })
  }

  const handleRemoveMedicament = (index: number) => {
    setMedicaments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGeneratePDF = async () => {
    const payload = {
      ...form,
      medicaments,
    }

    try {
      const res = await fetch("http://localhost:3001/medecin/ordonnances/pdf-manuel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")

      // Ajouter l'ordonnance à la liste après génération réussie
      const newOrdonnance: Ordonnance = {
        id: Date.now().toString(),
        patientNom: form.patientNom,
        date: form.date,
        medicaments: [...medicaments],
        conseils: form.conseils,
      }
      setOrdonnances((prev) => [newOrdonnance, ...prev])

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
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Ordonnance Manuelle</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowOrdonnancesList(!showOrdonnancesList)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {showOrdonnancesList ? "Masquer" : "Voir"} les ordonnances
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations Médecin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Informations Médecin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medecinNom">Nom du médecin</Label>
                    <Input
                      id="medecinNom"
                      name="medecinNom"
                      value={form.medecinNom}
                      onChange={handleFormChange}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinSpecialite">Spécialité</Label>
                    <Input
                      id="medecinSpecialite"
                      name="medecinSpecialite"
                      value={form.medecinSpecialite}
                      onChange={handleFormChange}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinAdresse">Adresse</Label>
                    <Input
                      id="medecinAdresse"
                      name="medecinAdresse"
                      value={form.medecinAdresse}
                      onChange={handleFormChange}
                      className="bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinDiplome">Diplôme</Label>
                    <Input
                      id="medecinDiplome"
                      name="medecinDiplome"
                      value={form.medecinDiplome}
                      onChange={handleFormChange}
                      placeholder="Diplôme (optionnel)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinTelephoneCabinet">Téléphone cabinet</Label>
                    <Input
                      id="medecinTelephoneCabinet"
                      name="medecinTelephoneCabinet"
                      value={form.medecinTelephoneCabinet}
                      onChange={handleFormChange}
                      placeholder="Téléphone cabinet"
                    />
                  </div>
                  <div>
                    <Label htmlFor="medecinTelephoneUrgence">Téléphone urgences</Label>
                    <Input
                      id="medecinTelephoneUrgence"
                      name="medecinTelephoneUrgence"
                      value={form.medecinTelephoneUrgence}
                      onChange={handleFormChange}
                      placeholder="Téléphone urgences"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations Patient */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientNom">Nom du patient *</Label>
                    <Input
                      id="patientNom"
                      name="patientNom"
                      value={form.patientNom}
                      onChange={handleFormChange}
                      placeholder="Nom complet du patient"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientAge">Âge</Label>
                    <Input
                      id="patientAge"
                      name="patientAge"
                      value={form.patientAge}
                      onChange={handleFormChange}
                      placeholder="Âge"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPoids">Poids</Label>
                    <Input
                      id="patientPoids"
                      name="patientPoids"
                      value={form.patientPoids}
                      onChange={handleFormChange}
                      placeholder="Poids (kg)"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-fit"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Médicaments */}
            <Card>
              <CardHeader>
                <CardTitle>Médicaments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomMedicament">Nom du médicament *</Label>
                      <Input
                        id="nomMedicament"
                        placeholder="Nom du médicament"
                        value={newMedicament.nom}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, nom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="posologie">Posologie *</Label>
                      <Input
                        id="posologie"
                        placeholder="Ex: 500mg 3x/jour"
                        value={newMedicament.posologie}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, posologie: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ar">AR</Label>
                      <Input
                        id="ar"
                        placeholder="Autorisation de remboursement"
                        value={newMedicament.ar}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, ar: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="qsp">QSP</Label>
                      <Input
                        id="qsp"
                        placeholder="Quantité suffisante pour"
                        value={newMedicament.qsp}
                        onChange={(e) => setNewMedicament((m) => ({ ...m, qsp: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mte"
                        checked={newMedicament.mte}
                        onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, mte: !!v }))}
                      />
                      <Label htmlFor="mte">MTE (Médicament à Tarif Exceptionnel)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="nr"
                        checked={newMedicament.nr}
                        onCheckedChange={(v) => setNewMedicament((m) => ({ ...m, nr: !!v }))}
                      />
                      <Label htmlFor="nr">NR (Non Remboursable)</Label>
                    </div>
                  </div>

                  <Button onClick={handleAddMedicament} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter le médicament
                  </Button>
                </div>

                {medicaments.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <h3 className="font-semibold">Médicaments ajoutés :</h3>
                    {medicaments.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{med.nom}</div>
                          <div className="text-sm text-gray-600">{med.posologie}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {med.mte && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2">MTE</span>
                            )}
                            {med.ar && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">AR: {med.ar}</span>
                            )}
                            {med.qsp && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">QSP: {med.qsp}</span>
                            )}
                            {med.nr && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">NR</span>}
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
                )}
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card>
              <CardHeader>
                <CardTitle>Conseils au patient</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="conseils"
                  rows={4}
                  value={form.conseils}
                  onChange={handleFormChange}
                  placeholder="Conseils, recommandations, instructions particulières..."
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Bouton de génération */}
            <div className="flex justify-center">
              <Button
                onClick={handleGeneratePDF}
                size="lg"
                className="px-8 py-3 text-lg"
                disabled={!form.patientNom || medicaments.length === 0}
              >
                <FileText className="h-5 w-5 mr-2" />
                Générer l'ordonnance PDF
              </Button>
            </div>
          </div>

          {/* Liste des ordonnances */}
          {showOrdonnancesList && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Ordonnances récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ordonnances.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Aucune ordonnance</p>
                    ) : (
                      ordonnances.map((ord) => (
                        <div key={ord.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="font-medium text-sm">{ord.patientNom}</div>
                          <div className="text-xs text-gray-500 mb-2">{ord.date}</div>
                          <div className="text-xs">
                            {ord.medicaments.length} médicament{ord.medicaments.length > 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            {ord.medicaments.map((m) => m.nom).join(", ")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
