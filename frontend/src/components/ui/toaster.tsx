"use client"
import { useToast } from '@/components/hooks/use-toast'
// adapte ce chemin selon ton arborescence
import { X } from "lucide-react"
import React from "react"

type ToastItem = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed z-[100] w-full max-h-screen p-4 flex flex-col-reverse gap-2 sm:top-auto sm:bottom-4 sm:right-4 sm:left-auto md:max-w-sm">
      {toasts.map(({ id, title, description, variant }: ToastItem) => (
        <div
          key={id}
          className={`relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-md border px-4 py-3 shadow-lg transition-all ${
            variant === "destructive"
              ? "border-red-500 bg-red-50 text-red-800"
              : "border bg-white text-gray-900"
          }`}
        >
          <div className="flex-1 grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm text-gray-700">{description}</div>}
          </div>
          <button
            onClick={() => dismiss(id)}
            className="ml-auto text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
