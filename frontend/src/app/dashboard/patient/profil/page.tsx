"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { User, Lock, Trash2, LogOut, Save, Eye, EyeOff, AlertTriangle, CheckCircle, Settings } from "lucide-react"

interface Patient {
  nom: string
  prenom: string
  email: string
  telephone: string
}

export default function ProfilPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/")
          return
        }

        const response = await fetch("http://localhost:3001/patient/profil", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement du profil")
        }

        const data = await response.json()
        setPatient(data)
      } catch (error) {
        setMessage({ type: "error", text: "Erreur lors du chargement du profil" })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleUpdate = async () => {
    if (!patient) return

    setUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/patient/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      setMessage({ type: "success", text: "Profil mis à jour avec succès" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "Veuillez saisir un nouveau mot de passe" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/patient/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du changement de mot de passe")
      }

      setMessage({ type: "success", text: "Mot de passe modifié avec succès" })
      setNewPassword("")
      setShowPasswordForm(false)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du changement de mot de passe" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Cette action supprimera définitivement votre compte. Continuer ?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/patient/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte")
      }

      localStorage.removeItem("token")
      router.push("/")
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la suppression du compte" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded-lg"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Alert className="max-w-md mx-4 bg-white border-red-200 shadow-xl rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertDescription>Impossible de charger les informations du profil</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Luxueux */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-900 to-slate-700 rounded-full mb-6 shadow-2xl">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-light text-slate-900 mb-3 tracking-tight">Mon Profil</h1>
          <p className="text-slate-500 text-lg font-light">Gérez vos informations en toute simplicité</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-8 flex justify-center">
            <Alert
              className={`max-w-md rounded-2xl shadow-lg border-0 ${
                message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="space-y-8">
          {/* Informations Personnelles */}
          <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8 pt-10 px-10">
              <CardTitle className="text-2xl font-light text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="nom" className="text-slate-700 font-medium text-sm uppercase tracking-wide">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={patient.nom}
                    onChange={(e) => setPatient({ ...patient, nom: e.target.value })}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 text-lg font-light focus:bg-white transition-all duration-200"
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="prenom" className="text-slate-700 font-medium text-sm uppercase tracking-wide">
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={patient.prenom}
                    onChange={(e) => setPatient({ ...patient, prenom: e.target.value })}
                    className="h-14 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 text-lg font-light focus:bg-white transition-all duration-200"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={patient.email}
                  onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 text-lg font-light focus:bg-white transition-all duration-200"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-3 mb-10">
                <Label htmlFor="telephone" className="text-slate-700 font-medium text-sm uppercase tracking-wide">
                  Téléphone
                </Label>
                <Input
                  id="telephone"
                  value={patient.telephone}
                  onChange={(e) => setPatient({ ...patient, telephone: e.target.value })}
                  className="h-14 rounded-xl border-slate-200 bg-slate-50/50 text-slate-900 text-lg font-light focus:bg-white transition-all duration-200"
                  placeholder="Votre numéro"
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="h-14 px-8 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white rounded-xl font-medium text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Save className="h-5 w-5 mr-3" />
                {updating ? "Mise à jour..." : "Sauvegarder"}
              </Button>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8 pt-10 px-10">
              <CardTitle className="text-2xl font-light text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-slate-600" />
                </div>
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="h-14 px-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-lg transition-all duration-200"
              >
                <Lock className="h-5 w-5 mr-3" />
                {showPasswordForm ? "Annuler" : "Modifier le mot de passe"}
              </Button>

              {showPasswordForm && (
                <div className="mt-8 p-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-3 mb-6">
                    <Label htmlFor="newPassword" className="text-slate-700 font-medium text-sm uppercase tracking-wide">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-14 rounded-xl border-slate-200 bg-white text-slate-900 text-lg font-light pr-14"
                        placeholder="Nouveau mot de passe"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-10 w-10 hover:bg-slate-100 rounded-lg"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    className="h-12 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8 pt-10 px-10">
              <CardTitle className="text-2xl font-light text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-slate-600" />
                </div>
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <Separator className="mb-8 bg-slate-100" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="h-14 px-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-lg flex-1 transition-all duration-200 bg-transparent"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Se déconnecter
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="h-14 px-8 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl font-medium text-lg flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Supprimer le compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
