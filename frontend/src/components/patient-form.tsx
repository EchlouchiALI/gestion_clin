"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Patient, PatientFormData } from "@/types/patient"

interface PatientFormProps {
  patient?: Patient
  onSubmit: (data: PatientFormData) => void
  onClose: () => void
}

export default function PatientForm({ patient, onSubmit, onClose }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "M",
    dateNaissance: "",
    lieuNaissance: "",
    password: "",
  })

  const [errors, setErrors] = useState<Partial<PatientFormData>>({})

  useEffect(() => {
    if (patient) {
      setFormData({
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
        telephone: patient.telephone,
        sexe: patient.sexe,
        dateNaissance: patient.dateNaissance,
        lieuNaissance: patient.lieuNaissance,
      })
    }
  }, [patient])

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {}

    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis"
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis"
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }
    if (!formData.telephone.trim()) newErrors.telephone = "Le téléphone est requis"
    if (!formData.dateNaissance) newErrors.dateNaissance = "La date de naissance est requise"
    if (!formData.lieuNaissance.trim()) newErrors.lieuNaissance = "Le lieu de naissance est requis"
    if (!patient && !formData.password?.trim()) {
      newErrors.password = "Le mot de passe est requis pour un nouveau patient"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{patient ? "Modifier le patient" : "Ajouter un patient"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                className={errors.prenom ? "border-red-500" : ""}
              />
              {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                className={errors.nom ? "border-red-500" : ""}
              />
              {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
              className={errors.telephone ? "border-red-500" : ""}
            />
            {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
            <Input
              id="lieuNaissance"
              value={formData.lieuNaissance}
              onChange={(e) => handleChange("lieuNaissance", e.target.value)}
              className={errors.lieuNaissance ? "border-red-500" : ""}
            />
            {errors.lieuNaissance && <p className="text-sm text-red-500">{errors.lieuNaissance}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe</Label>
              <Select value={formData.sexe} onValueChange={(value: "M" | "F" | "Autre") => handleChange("sexe", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => handleChange("dateNaissance", e.target.value)}
                className={errors.dateNaissance ? "border-red-500" : ""}
              />
              {errors.dateNaissance && <p className="text-sm text-red-500">{errors.dateNaissance}</p>}
            </div>
          </div>

          {!patient && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
                placeholder="Mot de passe par défaut: 123456"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{patient ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
