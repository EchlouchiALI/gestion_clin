import * as React from "react"
import { cn } from "@/lib/utils"



export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
      ghost: "text-blue-600 hover:bg-blue-50",
    }
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className, "px-4 py-2")}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
