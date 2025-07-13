"use client"

import type { FC } from "react"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Ordonnance, Medicament } from "@/types/ordonnance"
import { Mail, Edit, Trash2, Download, AlertCircle } from "lucide-react"

type Props = {
  ordonnance: Ordonnance
  refresh: () => void
  setSelected: (ord: Ordonnance | null) => void
  setShowForm: (show: boolean) => void
}

const OrdonnanceActions: FC<Props> = ({ ordonnance, refresh, setSelected, setShowForm }) => {
  const genererPDF = () => {
    try {
      const doc = new jsPDF()
      let y = 30 // Position Y de départ pour le contenu

      // --- En-tête de l'ordonnance ---
      doc.setFillColor(25, 118, 210) // Bleu professionnel
      doc.rect(0, 0, 210, 25, "F") // Rectangle de l'en-tête
      doc.setTextColor(255, 255, 255) // Texte blanc
      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.text("ORDONNANCE MÉDICALE", 105, 17, { align: "center" }) // Titre centré

      // --- Informations du Patient ---
      doc.setTextColor(0, 0, 0) // Texte noir
      doc.setFont("helvetica", "normal")
      doc.setFontSize(14)
      doc.text(`Patient : ${ordonnance.patient.nom} ${ordonnance.patient.prenom}`, 20, y)
      y += 8
      doc.setFontSize(12)
      doc.text(`Date : ${new Date(ordonnance.date).toLocaleDateString("fr-FR")}`, 20, y)
      y += 15

      // --- Ligne séparatrice ---
      doc.setDrawColor(200, 200, 200) // Gris clair
      doc.setLineWidth(0.5)
      doc.line(20, y, 190, y)
      y += 15

      // --- Section Médicaments Prescrits (Contenu principal) ---
      doc.setFontSize(16)
      doc.setTextColor(0, 121, 107) // Vert-bleu foncé
      doc.setFont("helvetica", "bold")
      doc.text("MÉDICAMENTS PRESCRITS", 20, y)
      y += 8

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")
      const medsContent = ordonnance.contenu.trim() || "Aucun médicament spécifié."
      const medsLines = doc.splitTextToSize(medsContent, 170)
      doc.text(medsLines, 25, y)
      y += medsLines.length * 7 + 10

      // --- Section Traitements ---
      if (ordonnance.traitements?.trim()) {
        doc.setFontSize(16)
        doc.setTextColor(56, 142, 60) // Vert foncé
        doc.setFont("helvetica", "bold")
        doc.text("TRAITEMENTS", 20, y)
        y += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        const traitementsLines = doc.splitTextToSize(ordonnance.traitements, 170)
        doc.text(traitementsLines, 25, y)
        y += traitementsLines.length * 7 + 10
      }

      // --- Section Durée du Traitement ---
      if (ordonnance.duree?.trim()) {
        doc.setFontSize(16)
        doc.setTextColor(255, 152, 0) // Orange
        doc.setFont("helvetica", "bold")
        doc.text("DURÉE DU TRAITEMENT", 20, y)
        y += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        const dureeLines = doc.splitTextToSize(ordonnance.duree, 170)
        doc.text(dureeLines, 25, y)
        y += dureeLines.length * 7 + 10
      }

      // --- Section Analyses à Effectuer ---
      if (ordonnance.analyses?.trim()) {
        doc.setFontSize(16)
        doc.setTextColor(103, 58, 183) // Violet foncé
        doc.setFont("helvetica", "bold")
        doc.text("ANALYSES À EFFECTUER", 20, y)
        y += 8

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        const analysesLines = doc.splitTextToSize(ordonnance.analyses, 170)
        doc.text(analysesLines, 25, y)
        y += analysesLines.length * 7 + 10
      }

      // --- Pied de page ---
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100) // Gris
      doc.setFont("helvetica", "normal")
      doc.text(
        `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
        105,
        280,
        { align: "center" },
      )

      // --- Sauvegarde du fichier PDF ---
      doc.save(`ordonnance-${ordonnance.patient.nom}-${ordonnance.id}.pdf`)
      alert("✅ PDF généré avec succès !")
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert("❌ Erreur lors de la génération du PDF")
    }
  }

  
  

  
  const envoyerEmail = async () => {
    try {
      const res = await fetch(`http://localhost:3001/medecin/ordonnances/${ordonnance.id}/email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!res.ok) throw new Error("Erreur lors de l'envoi de l'email")
      alert("✅ Email envoyé avec succès")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Erreur lors de l'envoi de l'email")
    }
  }

  const supprimer = async () => {
    try {
      const res = await fetch(`http://localhost:3001/medecin/ordonnances/${ordonnance.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!res.ok) throw new Error("Erreur lors de la suppression")
      alert("✅ Ordonnance supprimée avec succès")
      refresh()
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Erreur lors de la suppression")
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Bouton PDF */}
      <Button
        size="sm"
        variant="outline"
        onClick={genererPDF}
        className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
      >
        <Download className="w-3 h-3 mr-1" />
        PDF
      </Button>

      {/* Bouton Email */}
      <Button
        size="sm"
        variant="outline"
        onClick={envoyerEmail}
        className="h-8 px-3 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
      >
        <Mail className="w-3 h-3 mr-1" />
        Email
      </Button>

      {/* Bouton Modifier */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSelected(ordonnance)
          setShowForm(true)
        }}
        className="h-8 px-3 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
      >
        <Edit className="w-3 h-3 mr-1" />
        Modifier
      </Button>

      {/* Bouton Supprimer avec confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Supprimer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ordonnance pour{" "}
              <span className="font-semibold">
                {ordonnance.patient.nom} {ordonnance.patient.prenom}
              </span>{" "}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={supprimer} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrdonnanceActions
