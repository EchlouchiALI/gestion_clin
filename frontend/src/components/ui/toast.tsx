import * as React from "react"
import { cva } from "class-variance-authority"

export const toastVariants = cva("fixed z-50 rounded-md p-4 shadow-lg text-sm", {
  variants: {
    variant: {
      default: "bg-white text-black",
      destructive: "bg-red-600 text-white"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

export function Toast({ title, description, variant = "default" }: {
  title: string
  description?: string
  variant?: "default" | "destructive"
}) {
  return (
    <div className={toastVariants({ variant })}>
      <strong>{title}</strong>
      {description && <div>{description}</div>}
    </div>
  )
}
