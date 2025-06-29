'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { User, Calendar, FileText, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RdvModal from '@/components/rdv-modal'

type Medecin = {
  nom: string
  prenom: string
  email: string
}

export default function DashboardMedecinPage() {
  const [medecin, setMedecin] = useState<Medecin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')

    fetch('http://localhost:3001/medecin/me/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Profil reçu depuis l'API :", data)
        setMedecin(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('❌ Erreur API profile :', err)
        router.push('/login')
      })
  }, [])

  if (loading) return <Skeleton className="h-16 w-full" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6 space-y-10">
      {/* 🎉 Message de bienvenue avec animation */}
      <motion.h1
        className="text-4xl font-extrabold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {medecin
          ? `Bienvenue Dr. ${medecin.prenom} ${medecin.nom}`
          : 'Chargement...'}
      </motion.h1>

      {/* 🧊 Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{ label: 'Patients', Icon: User }, { label: 'Rendez-vous', Icon: Calendar }, { label: 'Ordonnances', Icon: FileText }].map(({ label, Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-inner border border-white/10 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-3xl font-semibold text-white">--</p>
              </div>
              <Icon className="w-10 h-10 text-cyan-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🚀 Boutons d’action */}
      <div className="flex flex-wrap gap-4 justify-start mt-4">
        {/* ➕ Gérer les patients */}
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => router.push('/dashboard/medecin/patient')}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Gérer les Patients
        </Button>

        {/* 📅 Voir rendez-vous */}
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => router.push('/dashboard/medecin/rendezvous')}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Voir les Rendez-vous
        </Button>

        {/* 📄 Voir ordonnances */}
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => router.push('/dashboard/medecin/ordonnances')}
        >
          <FileText className="w-5 h-5 mr-2" />
          Voir les Ordonnances
        </Button>
      </div>
    </div>
  )
}
