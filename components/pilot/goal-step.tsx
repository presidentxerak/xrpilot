"use client"

import { Coins, Layers, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const goals = [
  {
    id: "xrp",
    label: "Get XRP",
    icon: Coins,
    description: "Buy XRP to hold or use on the ledger",
  },
  {
    id: "tokens",
    label: "Get XRPL Tokens",
    icon: Layers,
    description: "Trade for tokens issued on XRPL",
  },
  {
    id: "nfts",
    label: "Buy XRPL NFTs",
    icon: ImageIcon,
    description: "Collect NFTs on the XRP Ledger",
  },
]

interface GoalStepProps {
  selected: string
  onSelect: (goal: string) => void
}

export function GoalStep({ selected, onSelect }: GoalStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center">
          <Layers className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">What do you want to do on XRPL?</h2>
        <p className="text-muted-foreground">Select your destination on the ledger</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {goals.map((goal) => {
          const Icon = goal.icon
          return (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className={cn(
                "p-6 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg",
                selected === goal.id
                  ? "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 text-white shadow-xl"
                  : "bg-card hover:bg-muted/50 text-foreground",
              )}
            >
              <Icon className={cn("w-10 h-10 mb-4", selected === goal.id ? "text-white" : "text-primary")} />
              <h3 className="font-semibold text-lg">{goal.label}</h3>
              <p className={cn("text-sm mt-2", selected === goal.id ? "text-white/80" : "text-muted-foreground")}>
                {goal.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
