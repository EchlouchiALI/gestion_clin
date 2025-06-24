import * as React from "react"
import { cn } from "@/lib/utils"

// ✅ La carte principale
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border bg-white text-gray-900 shadow", className)} {...props} />
}

// ✅ Le contenu de la carte (padding intérieur)
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />
}

// ✅ Le haut de la carte (comme un en-tête)
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-4", className)} {...props} />
}

// ✅ Le titre de la carte (gros texte)
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}
