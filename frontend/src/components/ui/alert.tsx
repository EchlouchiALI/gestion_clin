import React from "react"
import { cn } from "@/lib/utils"

export function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 border rounded-lg", className)}>{children}</div>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm">{children}</p>
}
