"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Mail, Lock, UserRound, CalendarDays, MapPin, ArrowRight, Sparkles, Shield, Clock } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    age: "",
    lieuNaissance: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await axios.post("http://localhost:3001/auth/register", {
        ...form,
        age: Number.parseInt(form.age, 10),
      })
      router.push("/login")
    } catch (err) {
      setError("Une erreur s'est produite. Vérifiez vos informations.")
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "Informations personnelles",
      fields: ["nom", "prenom"],
      icon: UserRound,
    },
    {
      title: "Coordonnées",
      fields: ["email", "password"],
      icon: Mail,
    },
    {
      title: "Détails complémentaires",
      fields: ["age", "lieuNaissance"],
      icon: CalendarDays,
    },
  ]

  const fieldConfig = {
    nom: { placeholder: " Nom de famille", icon: UserRound, type: "text" },
    prenom: { placeholder: "Prénom", icon: UserRound, type: "text" },
    email: { placeholder: "Adresse e-mail", icon: Mail, type: "email" },
    password: { placeholder: "Mot de passe", icon: Lock, type: "password" },
    age: { placeholder: "Âge", icon: CalendarDays, type: "number" },
    lieuNaissance: { placeholder: "Lieu de naissance", icon: MapPin, type: "text" },
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepComplete = (stepIndex: number) => {
    return steps[stepIndex].fields.every((field) => form[field as keyof typeof form])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
                      {index < currentStep ? <ArrowRight className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
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
                <p className="text-slate-400 text-sm">
                  Étape {currentStep + 1} sur {steps.length}
                </p>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current step fields */}
                <div className="space-y-4">
                  {steps[currentStep].fields.map((fieldName) => {
                    const config = fieldConfig[fieldName as keyof typeof fieldConfig]
                    const Icon = config.icon
                    const value = form[fieldName as keyof typeof form]

                    return (
                      <div key={fieldName} className="group">
                        <label className="block text-sm font-medium text-slate-300 mb-2">{config.placeholder}</label>
                        <div className="relative">
                          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type={config.type}
                            name={fieldName}
                            placeholder={`        Entrez votre ${config.placeholder.toLowerCase()}`}
                            onChange={handleChange}
                            value={value}
                            required
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                          />
                          {value && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                    <p className="text-red-300 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex space-x-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-semibold transition-all duration-300 border border-white/20"
                    >
                      Précédent
                    </button>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepComplete(currentStep)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <span>Suivant</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || !isStepComplete(currentStep)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Création...</span>
                        </div>
                      ) : (
                        "Créer mon compte"
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Login link */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-slate-300">
                  Déjà inscrit ?{" "}
                  <button
                    onClick={() => router.push("/login")}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </div>

            {/* Mobile branding */}
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Polyclinique Atlas</span>
              </div>
              <p className="text-slate-400 text-sm">Excellence médicale • Sécurité garantie</p>
            </div>
          </div>
        </div>
      </div>
    
  )
}
