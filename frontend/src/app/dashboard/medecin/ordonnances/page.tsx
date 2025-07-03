'use client'

import OrdonnanceList from '@/components/OrdonnanceList'

export default function OrdonnancesPage() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📋 Gestion des Ordonnances</h1>
      <OrdonnanceList />
    </main>
  )
}
