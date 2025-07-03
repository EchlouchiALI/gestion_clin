'use client'

import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Ordonnance } from '@/types/ordonnance'
import { FC } from 'react'

type Props = {
  ordonnance: Ordonnance
  refresh: () => void
  setSelected: (ord: Ordonnance | null) => void
  setShowForm: (show: boolean) => void
}

const OrdonnanceActions: FC<Props> = ({ ordonnance, refresh, setSelected, setShowForm }) => {
  const genererPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Ordonnance - Patient : ${ordonnance.patient.nom} ${ordonnance.patient.prenom}`, 10, 20)
    doc.text(`Date : ${ordonnance.date}`, 10, 30)

    if (ordonnance.medicaments?.length) {
      doc.setFontSize(12)
      ordonnance.medicaments.forEach((medicament, index) => {
        doc.text(`${index + 1}. ${medicament.nom} - ${medicament.posologie}`, 10, 40 + index * 10)
      })
    } else {
      doc.setFontSize(12)
      doc.text('Aucun médicament spécifié.', 10, 40)
    }

    doc.save(`ordonnance-${ordonnance.id}.pdf`)
  }

  const envoyerEmail = () => {
    fetch(`http://localhost:3001/medecin/ordonnances/${ordonnance.id}/email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de l’envoi de l’email')
        alert('📧 Email envoyé avec succès')
      })
      .catch(err => {
        console.error(err)
        alert('❌ Échec de l’envoi de l’email')
      })
  }

  const supprimer = () => {
    const confirmer = confirm('🗑️ Supprimer cette ordonnance ?')
    if (!confirmer) return

    fetch(`http://localhost:3001/medecin/ordonnances/${ordonnance.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la suppression')
        alert('✅ Ordonnance supprimée')
        refresh()
      })
      .catch(err => {
        console.error(err)
        alert('❌ Échec de la suppression')
      })
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" onClick={genererPDF}>📄 PDF</Button>
      <Button size="sm" onClick={envoyerEmail}>📧 Email</Button>
      <Button size="sm" onClick={() => {
        setSelected(ordonnance)
        setShowForm(true)
      }}>✏️ Modifier</Button>
      <Button size="sm" variant="destructive" onClick={supprimer}>🗑️ Supprimer</Button>
    </div>
  )
}

export default OrdonnanceActions
