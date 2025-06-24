"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, ArrowLeft, Shield, CheckCircle, Key, RefreshCw } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const steps = [
    {
      title: "Adresse e-mail",
      subtitle: "Saisissez votre adresse e-mail pour recevoir le code de récupération",
      icon: Mail,
    },
    {
      title: "Code de vérification",
      subtitle: "Entrez le code de 6 chiffres envoyé à votre adresse e-mail",
      icon: Shield,
    },
    {
      title: "Nouveau mot de passe",
      subtitle: "Créez un nouveau mot de passe sécurisé pour votre compte",
      icon: Key,
    },
  ]

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await axios.post("http://localhost:3001/auth/forgot-password", { email })
      setSuccessMessage("Code de récupération envoyé avec succès !")
      setCurrentStep(1)
    } catch (err) {
      setError("Erreur lors de l'envoi du code. Vérifiez votre adresse e-mail.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await axios.post("http://localhost:3001/auth/verify-reset-code", { email, code })
      setSuccessMessage("Code vérifié avec succès !")
      setCurrentStep(2)
    } catch (err) {
      setError("Code incorrect. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setIsLoading(true)

    try {
      await axios.post("http://localhost:3001/auth/reset-password", {
        email,
        code,
        newPassword,
      })
      setSuccessMessage("Mot de passe réinitialisé avec succès !")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      setError("Erreur lors de la réinitialisation. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError("")
      setSuccessMessage("")
    } else {
      router.push("/login")
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    try {
      await axios.post("http://localhost:3001/auth/forgot-password", { email })
      setSuccessMessage("Nouveau code envoyé !")
    } catch (err) {
      setError("Erreur lors du renvoi du code.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <div className="max-w-lg">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Polyclinique Atlas</h1>
                <p className="text-purple-300 text-sm">Récupération sécurisée</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Récupération
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                de compte
              </span>
            </h2>

            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Pas de panique ! Nous allons vous aider à récupérer l'accès à votre compte en toute sécurité.
            </p>

            {/* Process steps */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Mail, text: "Saisie de votre adresse e-mail", step: 0 },
                { icon: Shield, text: "Vérification du code de sécurité", step: 1 },
                { icon: Key, text: "Création d'un nouveau mot de passe", step: 2 },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      currentStep >= item.step
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {currentStep > item.step ? <CheckCircle className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`transition-colors duration-300 ${
                      currentStep >= item.step ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Security info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-white">Sécurité renforcée</h3>
              </div>
              <p className="text-sm text-slate-300">
                Le processus de récupération utilise un code temporaire sécurisé. Votre compte reste protégé pendant
                toute la procédure.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index <= currentStep
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {index < currentStep ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-2 transition-all duration-300 ${
                          index < currentStep ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-1">{steps[currentStep].title}</h3>
                <p className="text-slate-400 text-sm">{steps[currentStep].subtitle}</p>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              {/* Step 0: Email */}
              {currentStep === 0 && (
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Adresse e-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="email"
                        placeholder="Entrez votre adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                      />
                      {email && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                      <p className="text-green-300 text-sm text-center">{successMessage}</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                      <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le code</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 1: Verification Code */}
              {currentStep === 1 && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Code de vérification</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="Entrez le code à 6 chiffres"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={6}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-center text-2xl tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-2">Code envoyé à {email}</p>
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={isLoading}
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Renvoyer le code</span>
                    </button>
                  </div>

                  {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                      <p className="text-green-300 text-sm text-center">{successMessage}</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                      <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <span>Vérifier le code</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: New Password */}
              {currentStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="password"
                        placeholder="Entrez votre nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        type="password"
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                      />
                      {confirmPassword && newPassword === confirmPassword && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Force du mot de passe</span>
                      <span
                        className={`font-medium ${
                          newPassword.length >= 8
                            ? "text-green-400"
                            : newPassword.length >= 6
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {newPassword.length >= 8 ? "Fort" : newPassword.length >= 6 ? "Moyen" : "Faible"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          newPassword.length >= 8
                            ? "bg-green-500 w-full"
                            : newPassword.length >= 6
                              ? "bg-yellow-500 w-2/3"
                              : "bg-red-500 w-1/3"
                        }`}
                      />
                    </div>
                  </div>

                  {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                      <p className="text-green-300 text-sm text-center">{successMessage}</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                      <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Réinitialisation...</span>
                      </>
                    ) : (
                      <>
                        <span>Réinitialiser le mot de passe</span>
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back button */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <button
                  onClick={goBack}
                  className="w-full flex items-center justify-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>{currentStep === 0 ? "Retour à la connexion" : "Étape précédente"}</span>
                </button>
              </div>
            </div>

            {/* Mobile branding */}
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Polyclinique Atlas</span>
              </div>
              <p className="text-slate-400 text-sm">Récupération sécurisée • Support 24h/7j</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
