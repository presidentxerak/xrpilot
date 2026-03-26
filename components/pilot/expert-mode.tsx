"use client"

import { Settings, Zap, Shield, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpertModeProps {
  enabled: boolean
  preferences: {
    lowestFees: boolean
    speed: boolean
    privacy: boolean
    noKyc: boolean
  }
  onToggle: () => void
  onPreferenceChange: (key: keyof ExpertModeProps["preferences"]) => void
}

export function ExpertMode({ enabled, preferences, onToggle, onPreferenceChange }: ExpertModeProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
          enabled
            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
      >
        <Settings className="w-4 h-4" />
        Expert Mode
      </button>

      {enabled && (
        <div className="p-4 rounded-2xl bg-muted/50 space-y-3">
          <h4 className="font-medium text-sm text-foreground">Advanced Preferences</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "lowestFees" as const, label: "Lowest Fees", icon: DollarSign },
              { key: "speed" as const, label: "Prefer Speed", icon: Zap },
              { key: "privacy" as const, label: "Prefer Privacy", icon: Shield },
              { key: "noKyc" as const, label: "No KYC if possible", icon: Shield },
            ].map((pref) => (
              <button
                key={pref.key}
                onClick={() => onPreferenceChange(pref.key)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-sm transition-all",
                  preferences[pref.key]
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted",
                )}
              >
                <pref.icon className="w-4 h-4" />
                {pref.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
