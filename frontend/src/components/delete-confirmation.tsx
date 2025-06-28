"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import type { Patient } from "@/types/patient" // ✅ correction de l'import

interface DeleteConfirmationProps {
  patient: Patient
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DeleteConfirmation({
  patient,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteConfirmationProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Confirmer la suppression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Êtes-vous sûr de vouloir supprimer le patient{" "}
          <strong>
            {patient.prenom} {patient.nom}
          </strong>{" "}
          ?
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Cette action est irréversible et supprimera toutes les données associées.
        </p>
        <div className="flex gap-2">
          {/* 🔧 suppression de variant="destructive" si non supporté */}
          <Button
            variant="ghost"
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
