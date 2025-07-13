"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Ordonnance } from "@/types/ordonnance"
import OrdonnanceForm from "./OrdonnanceForm"
import OrdonnanceActions from "./OrdonnanceActions"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "./ui/dialog"
import {
  Plus,
  FileText,
  User,
  Calendar,
  Pill,
  Clock,
  FlaskConical,
  Settings,
  Search,
  Filter,
  Download,
  Stethoscope,
} from "lucide-react"

export default function OrdonnanceList() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([])
  const [selected, setSelected] = useState<Ordonnance | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOrdonnances = async () => {
    try {
      const res = await fetch("http://localhost:3001/medecin/ordonnances", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!res.ok) {
        console.error("❌ Erreur lors de la récupération des ordonnances")
        return
      }
      const data = await res.json()
      setOrdonnances(data)
    } catch (error) {
      console.error("Erreur de chargement des ordonnances :", error)
    }
  }

  useEffect(() => {
    fetchOrdonnances()
  }, [])

  const handleNewOrdonnance = () => {
    setSelected(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelected(null)
    fetchOrdonnances()
  }

  const handleSubmitCustomOrdonnance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      nom: formData.get("nom"),
      age: formData.get("age"),
      poids: formData.get("poids"),
      medicaments: formData.get("medicaments"),
      recommandations: formData.get("recommandations"),
    }

    try {
      const res = await fetch("http://localhost:3001/medecin/ordonnances/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Erreur lors de la génération du PDF")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
      setShowCustomForm(false)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Échec de génération de l'ordonnance.")
    }
  }

  const filteredOrdonnances = ordonnances.filter(
    (ord) =>
      ord.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.contenu.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Ordonnances</h1>
                <p className="text-gray-600">Créez et gérez vos prescriptions médicales</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleNewOrdonnance}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-11 px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle ordonnance
            </Button>
            <Button
              onClick={() => setShowCustomForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-11 px-6"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ordonnance personnalisée
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par patient ou contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" className="h-11 px-4 border-gray-200 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Ordonnances</p>
                  <p className="text-3xl font-bold">{ordonnances.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ce mois</p>
                  <p className="text-3xl font-bold">
                    {
                      ordonnances.filter((ord) => {
                        const ordDate = new Date(ord.date)
                        const now = new Date()
                        return ordDate.getMonth() === now.getMonth() && ordDate.getFullYear() === now.getFullYear()
                      }).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Patients uniques</p>
                  <p className="text-3xl font-bold">{new Set(ordonnances.map((ord) => ord.patient.id)).size}</p>
                </div>
                <User className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Liste des Ordonnances
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Patient
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Contenu
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Traitements
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Durée
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" />
                        Analyses
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrdonnances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 font-medium">Aucune ordonnance trouvée</p>
                            <p className="text-gray-400 text-sm">Commencez par créer votre première ordonnance</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrdonnances.map((ord, index) => (
                      <tr
                        key={ord.id}
                        className={`border-b hover:bg-blue-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                              {ord.patient.nom.charAt(0)}
                              {ord.patient.prenom.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {ord.patient.nom} {ord.patient.prenom}
                              </p>
                              <p className="text-sm text-gray-500">Patient #{ord.patient.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {new Date(ord.date).toLocaleDateString("fr-FR")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="text-gray-900 truncate" title={ord.contenu}>
                              {ord.contenu}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            {ord.traitements ? (
                              <p className="text-gray-700 truncate" title={ord.traitements}>
                                {ord.traitements}
                              </p>
                            ) : (
                              <span className="text-gray-400 italic">Non spécifié</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {ord.duree ? (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              {ord.duree}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            {ord.analyses ? (
                              <p className="text-gray-700 truncate" title={ord.analyses}>
                                {ord.analyses}
                              </p>
                            ) : (
                              <span className="text-gray-400 italic">Aucune</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <OrdonnanceActions
                            ordonnance={ord}
                            refresh={fetchOrdonnances}
                            setSelected={setSelected}
                            setShowForm={setShowForm}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire classique */}
        {showForm && <OrdonnanceForm ordonnance={selected} onClose={handleCloseForm} />}

        {/* Formulaire personnalisé */}
        <Dialog open={showCustomForm} onOpenChange={setShowCustomForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Nouvelle ordonnance personnalisée
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitCustomOrdonnance} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Nom du patient *
                  </label>
                  <Input
                    name="nom"
                    placeholder="Nom complet du patient"
                    required
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Âge *</label>
                  <Input
                    name="age"
                    placeholder="Âge en années"
                    type="number"
                    required
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Poids *</label>
                <Input
                  name="poids"
                  placeholder="Poids en kg"
                  required
                  className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  Liste des médicaments *
                </label>
                <Textarea
                  name="medicaments"
                  placeholder="Listez les médicaments avec posologie et fréquence..."
                  required
                  className="min-h-[120px] border-gray-200 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Recommandations
                </label>
                <Textarea
                  name="recommandations"
                  placeholder="Recommandations et conseils pour le patient..."
                  className="min-h-[100px] border-gray-200 focus:border-green-500 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowCustomForm(false)} className="px-6 h-11">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="px-6 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Créer PDF
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
