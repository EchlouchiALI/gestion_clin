"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator" // Assuming you have a Separator component
import type { Ordonnance } from "@/types/ordonnance"
import { User, FileText, Pill, Clock, FlaskConical, Save, X, AlertCircle, Stethoscope, Info } from "lucide-react"

interface Props {
  ordonnance: Ordonnance | null
  onClose: () => void
}

interface Patient {
  id: number
  nom: string
  prenom: string
  email?: string
  telephone?: string
}

export default function OrdonnanceForm({ ordonnance, onClose }: Props) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState<number | "">(ordonnance?.patient?.id || "")
  const [contenu, setContenu] = useState(ordonnance?.contenu || "")
  const [traitements, setTraitements] = useState(ordonnance?.traitements || "")
  const [duree, setDuree] = useState(ordonnance?.duree || "")
  const [analyses, setAnalyses] = useState(ordonnance?.analyses || "")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch("http://localhost:3001/medecin/patients", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Erreur chargement patients", err))
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!patientId) {
      newErrors.patientId = "Veuillez sélectionner un patient"
    }
    if (!contenu.trim()) {
      newErrors.contenu = "Le contenu est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    const payload = {
      contenu: contenu.trim(),
      traitements: traitements.trim(),
      duree: duree.trim(),
      analyses: analyses.trim(),
      patientId,
    }

    const method = ordonnance ? "PUT" : "POST"
    const url = ordonnance
      ? `http://localhost:3001/medecin/ordonnances/${ordonnance.id}`
      : `http://localhost:3001/medecin/ordonnances`

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Token non trouvé, veuillez vous reconnecter.")
        return
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde")

      alert("✅ Ordonnance enregistrée avec succès")
      onClose()
    } catch (err) {
      console.error(err)
      alert("❌ Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const selectedPatient = patients.find((p) => p.id === patientId)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg shadow-xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            {ordonnance ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Section Patient */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Informations du Patient
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient-select" className="text-sm font-medium text-gray-700 mb-2 block">
                  Patient *
                </Label>
                <div className="relative">
                  <select
                    id="patient-select"
                    className={`w-full h-11 px-4 pr-10 border rounded-md bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer ${
                      errors.patientId ? "border-red-400" : "border-gray-300"
                    }`}
                    value={patientId}
                    onChange={(e) => {
                      setPatientId(Number(e.target.value))
                      setErrors({ ...errors, patientId: "" })
                    }}
                    required
                  >
                    <option value="" disabled>
                      Sélectionner un patient
                    </option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} {p.prenom}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                    </svg>
                  </div>
                </div>
                {errors.patientId && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.patientId}
                  </p>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200 text-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {selectedPatient.nom.charAt(0)}
                      {selectedPatient.prenom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedPatient.nom} {selectedPatient.prenom}
                      </p>
                      {selectedPatient.email && <p className="text-sm">{selectedPatient.email}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section Prescription */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Détails de la Prescription
            </h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="contenu" className="text-sm font-medium text-gray-700 mb-2 block">
                  Contenu de l'ordonnance *
                </Label>
                <Textarea
                  id="contenu"
                  value={contenu}
                  onChange={(e) => {
                    setContenu(e.target.value)
                    setErrors({ ...errors, contenu: "" })
                  }}
                  placeholder="Ex: Doliprane 3x/jour, repos strict..."
                  className={`min-h-[120px] border rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.contenu ? "border-red-400" : "border-gray-300"
                  }`}
                  required
                />
                {errors.contenu && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contenu}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="traitements" className="text-sm font-medium text-gray-700 mb-2 block">
                    <Pill className="w-4 h-4 inline-block mr-1 text-purple-500" />
                    Traitements prescrits
                  </Label>
                  <Textarea
                    id="traitements"
                    value={traitements}
                    onChange={(e) => setTraitements(e.target.value)}
                    placeholder="Ex: Antibiotique 500mg, matin et soir&#10;Anti-inflammatoire, 2 fois par jour"
                    className="min-h-[100px] border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <Label htmlFor="analyses" className="text-sm font-medium text-gray-700 mb-2 block">
                    <FlaskConical className="w-4 h-4 inline-block mr-1 text-orange-500" />
                    Analyses à effectuer
                  </Label>
                  <Textarea
                    id="analyses"
                    value={analyses}
                    onChange={(e) => setAnalyses(e.target.value)}
                    placeholder="Ex: Prise de sang, glycémie&#10;Analyse d'urine"
                    className="min-h-[100px] border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duree" className="text-sm font-medium text-gray-700 mb-2 block">
                  <Clock className="w-4 h-4 inline-block mr-1 text-teal-500" />
                  Durée du traitement
                </Label>
                <Input
                  id="duree"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  placeholder="Ex: 7 jours, 2 semaines, 1 mois..."
                  className="h-11 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Informations importantes */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-semibold">Informations importantes</p>
            </div>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>Vérifiez les allergies du patient avant de prescrire.</li>
              <li>Assurez-vous de la posologie et des interactions médicamenteuses.</li>
              <li>Les champs marqués d'un * sont obligatoires.</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6 h-11 text-gray-700 border-gray-300 hover:bg-gray-100 bg-transparent"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !patientId || !contenu.trim()}
            className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Enregistrer
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
