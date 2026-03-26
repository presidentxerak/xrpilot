"use client"

import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"

    const sizeStyles = {
      sm: "px-4 py-2 text-sm",
      default: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    const variantStyles = {
      default:
        "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white shadow-lg hover:shadow-xl animate-gradient",
      outline:
        "bg-transparent border-2 border-transparent bg-clip-padding before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-cyan-400 before:p-[2px] text-foreground hover:text-primary",
    }

    return (
      <button ref={ref} className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
        {children}
      </button>
    )
  },
)

GradientButton.displayName = "GradientButton"
