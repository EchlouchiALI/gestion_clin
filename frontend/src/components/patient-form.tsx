"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, User, Mail, Phone, Calendar, MapPin, Lock, Heart, Pill, AlertTriangle, FileText } from "lucide-react"

interface Patient {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  sexe?: string
  lieuNaissance?: string
  dateNaissance?: string
  maladiesConnues?: string
  traitementsEnCours?: string
  allergies?: string
  antecedentsMedicaux?: string
}

interface PatientFormProps {
  patient?: Patient
  onSubmit: (data: any) => void
  onClose: () => void
}

export default function PatientForm({ patient, onSubmit, onClose }: PatientFormProps) {
  const [formData, setFormData] = useState({
    nom: patient?.nom || "",
    prenom: patient?.prenom || "",
    email: patient?.email || "",
    telephone: patient?.telephone || "",
    sexe: patient?.sexe || "",
    lieuNaissance: patient?.lieuNaissance || "",
    dateNaissance: patient?.dateNaissance || "",
    password: "",
    maladiesConnues: patient?.maladiesConnues || "",
    traitementsEnCours: patient?.traitementsEnCours || "",
    allergies: patient?.allergies || "",
    antecedentsMedicaux: patient?.antecedentsMedicaux || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
        <CardHeader className="flex flex-row justify-between items-center border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {patient ? "Modifier Patient" : "Nouveau Patient"}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/50">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Section Informations personnelles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-800">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nom de famille"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm font-medium text-gray-700">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Prénom"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="exemple@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Sexe *</Label>
                  <select
                    value={formData.sexe}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                    className="w-full h-11 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                    required
                  >
                    <option value="">Sélectionnez le sexe</option>
                    <option value="masculin">Masculin</option>
                    <option value="féminin">Féminin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateNaissance" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date de naissance *
                  </Label>
                  <Input
                    id="dateNaissance"
                    type="date"
                    value={formData.dateNaissance}
                    onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lieuNaissance" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Lieu de naissance
                  </Label>
                  <Input
                    id="lieuNaissance"
                    value={formData.lieuNaissance}
                    onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ville, Pays"
                  />
                </div>

                {!patient && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Mot de passe
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Laissez vide pour '123456'"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">Si laissé vide, le mot de passe par défaut sera "123456"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Informations médicales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Heart className="w-4 h-4 text-red-500" />
                <h3 className="font-medium text-gray-800">Informations médicales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="maladiesConnues"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 text-red-400" />
                    Maladies connues
                  </Label>
                  <Textarea
                    id="maladiesConnues"
                    value={formData.maladiesConnues}
                    onChange={(e) => setFormData({ ...formData, maladiesConnues: e.target.value })}
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Décrivez les maladies connues..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="traitementsEnCours"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    <Pill className="w-3 h-3 text-green-500" />
                    Traitements en cours
                  </Label>
                  <Textarea
                    id="traitementsEnCours"
                    value={formData.traitementsEnCours}
                    onChange={(e) => setFormData({ ...formData, traitementsEnCours: e.target.value })}
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Listez les traitements actuels..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Mentionnez toutes les allergies connues..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="antecedentsMedicaux"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-blue-500" />
                    Antécédents médicaux
                  </Label>
                  <Textarea
                    id="antecedentsMedicaux"
                    value={formData.antecedentsMedicaux}
                    onChange={(e) => setFormData({ ...formData, antecedentsMedicaux: e.target.value })}
                    className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Historique médical pertinent..."
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 h-11 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {patient ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
