'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [rendezvous, setRendezvous] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ date: '', heure: '', motif: '', medecinId: '' })
  const [medecins, setMedecins] = useState<any[]>([])
  const [message, setMessage] = useState({ sujet: '', contenu: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return (window.location.href = '/login')

        const headers = { Authorization: `Bearer ${token}` }

        const resUser = await axios.get('http://localhost:3001/patients/me', { headers })
        const resRdv = await axios.get('http://localhost:3001/patients/rendezvous', { headers })
        const resMedecins = await axios.get('http://localhost:3001/medecins', { headers })

        setUser(resUser.data)
        setRendezvous(resRdv.data)
        setMedecins(resMedecins.data)
      } catch (err) {
        console.error('Erreur chargement dashboard patient:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRdvSubmit = async (e: any) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('http://localhost:3001/patients/rendezvous', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRendezvous([...rendezvous, res.data])
      alert('Rendez-vous créé avec succès')
    } catch (err) {
      console.error('Erreur prise de rendez-vous:', err)
    }
  }

  const handleMessageSubmit = async (e: any) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3001/patients/contact', message, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Message envoyé à la clinique')
    } catch (err) {
      console.error('Erreur message clinique:', err)
    }
  }

  if (loading) return <div className="p-8 text-center text-xl">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-900 flex items-center gap-2">
        👋 Bienvenue, <span className="text-black">{user?.prenom} {user?.nom}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infos personnelles */}
        <section className="bg-white backdrop-blur-md rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">🧍 Mes informations</h2>
          <ul className="space-y-1">
            <li><strong>Email :</strong> {user?.email}</li>
            <li><strong>Âge :</strong> {user?.age}</li>
            <li><strong>Lieu de naissance :</strong> {user?.lieuNaissance}</li>
          </ul>
        </section>

        {/* Prochain rendez-vous */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">📅 Mon prochain rendez-vous</h2>
          {rendezvous.length > 0 ? (
            <div>
              <p><strong>Date :</strong> {rendezvous[0].date} à {rendezvous[0].heure}</p>
              <p><strong>Médecin :</strong> {rendezvous[0].medecin.nom}</p>
              <p><strong>Motif :</strong> {rendezvous[0].motif}</p>
            </div>
          ) : (
            <p className="text-gray-600">Aucun rendez-vous à venir.</p>
          )}
        </section>

        {/* Historique */}
        <section className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-orange-700">📋 Historique de mes rendez-vous</h2>
          <ul className="divide-y">
            {rendezvous.map((rdv, idx) => (
              <li key={idx} className="py-2">
                {rdv.date} à {rdv.heure} — {rdv.medecin.nom} — {rdv.statut}
              </li>
            ))}
          </ul>
        </section>

        {/* Nouveau rendez-vous */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">➕ Prendre un rendez-vous</h2>
          <form onSubmit={handleRdvSubmit} className="space-y-3">
            <select className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, medecinId: e.target.value })} required>
              <option value="">Sélectionner un médecin</option>
              {medecins.map((m: any) => (
                <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
              ))}
            </select>
            <input type="date" className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <input type="time" className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, heure: e.target.value })} required />
            <input type="text" placeholder="Motif" className="w-full border p-2 rounded" onChange={(e) => setForm({ ...form, motif: e.target.value })} required />
            <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Valider</button>
          </form>
        </section>

        {/* Message clinique */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">📬 Contacter la clinique</h2>
          <form onSubmit={handleMessageSubmit} className="space-y-3">
            <input type="text" placeholder="Sujet" className="w-full border p-2 rounded" onChange={(e) => setMessage({ ...message, sujet: e.target.value })} required />
            <textarea placeholder="Votre message..." className="w-full border p-2 rounded" onChange={(e) => setMessage({ ...message, contenu: e.target.value })} required />
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer</button>
          </form>
        </section>
      </div>
    </div>
  )
}
