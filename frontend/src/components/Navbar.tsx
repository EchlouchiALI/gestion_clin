"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Gauche : Logo */}
        <div className="text-xl font-bold text-blue-400 tracking-wide">
          Polyclinique <span className="text-indigo-300">Atlas</span>
        </div>

        {/* Droite : Boutons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow transition"
          >
            Page d'accueil
          </button>
         
        </div>
      </div>
    </header>
  )
}
