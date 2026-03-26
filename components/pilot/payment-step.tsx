"use client"

import { CreditCard, Building2, Smartphone, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, description: "Visa, Mastercard, etc." },
  { id: "bank", label: "Bank Transfer", icon: Building2, description: "SEPA, Wire, ACH" },
  { id: "apple_pay", label: "Apple Pay", icon: Smartphone, description: "Fast mobile payment" },
  { id: "google_pay", label: "Google Pay", icon: Smartphone, description: "Android payment" },
  { id: "cash", label: "Cash", icon: Banknote, description: "P2P or Bitcoin ATMs" },
]

interface PaymentStepProps {
  selected: string
  onSelect: (method: string) => void
}

export function PaymentStep({ selected, onSelect }: PaymentStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">How do you want to pay?</h2>
        <p className="text-muted-foreground">Choose your preferred payment method</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "p-6 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg",
                selected === method.id
                  ? "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 text-white shadow-xl"
                  : "bg-card hover:bg-muted/50 text-foreground",
              )}
            >
              <Icon className={cn("w-8 h-8 mb-3", selected === method.id ? "text-white" : "text-primary")} />
              <h3 className="font-semibold text-lg">{method.label}</h3>
              <p className={cn("text-sm mt-1", selected === method.id ? "text-white/80" : "text-muted-foreground")}>
                {method.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
