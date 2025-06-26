"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Mail, Lock, LogIn, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await axios.post("http://localhost:3001/auth/login", { email, password })
      const token = res.data.access_token
      const user = res.data.user

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user)) // facultatif si tu veux y accéder facilement

      // Redirection selon le rôle
      if (user.role === "admin") {
        router.push("/dashboard/admin")
      } else if (user.role === "medecin") {
        router.push("/dashboard/medecin")
      } else {
        router.push("/dashboard/patient")
      }
    } catch (err) {
      setError("Identifiants incorrects. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mt-4 text-white">Connexion</h2>
          <p className="text-sm text-purple-200">Accédez à votre espace personnel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-4 h-4" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/30 bg-white/5 text-white placeholder:text-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span>{isLoading ? "Connexion..." : "Se connecter"}</span>
          </button>

          <div className="text-sm text-center text-purple-200 mt-4">
            <button
              onClick={() => router.push("/forgot-password")}
              type="button"
              className="text-purple-300 hover:text-white flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Mot de passe oublié ?</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-center text-purple-200">
          Pas encore de compte ?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-purple-300 hover:text-white font-medium"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  )
}
