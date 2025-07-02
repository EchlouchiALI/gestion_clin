"use client"

import type React from "react"

import { useState } from "react"
import type { Patient } from "@/types/patient"

type MessageFormProps = {
  patient: Patient
  onSubmit: (data: { subject: string; message: string }) => Promise<void>
  onClose: () => void
}

export function MessageForm({ patient, onSubmit, onClose }: MessageFormProps) {
  const [formData, setFormData] = useState({ subject: "", message: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-lg font-semibold text-gray-900">
          Contacter {patient.prenom} {patient.nom}
        </h2>

        <input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Sujet"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Message..."
          rows={4}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Envoyer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors duration-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
