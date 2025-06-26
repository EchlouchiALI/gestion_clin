import { useCallback } from "react"
import { Toast } from "@/components/ui/toast"

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string, description?: string, variant?: "default" | "destructive" }) => {
      alert(`${title}\n${description || ""}`) // temp fallback, replace with real toast in production
      // In prod, use toast container like React Hot Toast or Toastify
    }
  }
}
