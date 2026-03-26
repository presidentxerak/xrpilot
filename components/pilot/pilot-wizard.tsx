"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plane } from "lucide-react"
import { CountryStep } from "./country-step"
import { PaymentStep } from "./payment-step"
import { GoalStep } from "./goal-step"
import { ExpertMode } from "./expert-mode"
import { RouteResults } from "./route-results"
import { GradientButton } from "@/components/gradient-button"
import { calculateRoutes } from "@/lib/route-calculator"
import type { Route, UserSelection } from "@/lib/types"

type Step = "country" | "payment" | "goal" | "results"

export function PilotWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("country")
  const [selection, setSelection] = useState<UserSelection>({
    country: "",
    paymentMethod: "",
    goal: "",
  })
  const [routes, setRoutes] = useState<Route[]>([])
  const [expertMode, setExpertMode] = useState(false)
  const [expertPreferences, setExpertPreferences] = useState({
    lowestFees: false,
    speed: false,
    privacy: false,
    noKyc: false,
  })

  const steps: Step[] = ["country", "payment", "goal", "results"]
  const currentIndex = steps.indexOf(currentStep)

  const canProceed = () => {
    if (currentStep === "country") return selection.country !== ""
    if (currentStep === "payment") return selection.paymentMethod !== ""
    if (currentStep === "goal") return selection.goal !== ""
    return true
  }

  const handleNext = () => {
    if (currentStep === "goal") {
      const calculatedRoutes = calculateRoutes(selection)
      setRoutes(calculatedRoutes)
      setCurrentStep("results")
    } else {
      const nextIndex = currentIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex])
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleRestart = () => {
    setSelection({ country: "", paymentMethod: "", goal: "" })
    setCurrentStep("country")
    setRoutes([])
  }

  if (currentStep === "results") {
    return <RouteResults selection={selection} routes={routes} onRestart={handleRestart} />
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.slice(0, 3).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                index < currentIndex
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white"
                  : index === currentIndex
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white animate-gradient"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            {index < 2 && (
              <div
                className={`w-12 md:w-20 h-1 mx-1 rounded-full transition-all ${
                  index < currentIndex ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Expert Mode Toggle */}
      <div className="flex justify-end">
        <ExpertMode
          enabled={expertMode}
          preferences={expertPreferences}
          onToggle={() => setExpertMode(!expertMode)}
          onPreferenceChange={(key) => setExpertPreferences((prev) => ({ ...prev, [key]: !prev[key] }))}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === "country" && (
          <CountryStep
            selected={selection.country}
            onSelect={(country) => setSelection((prev) => ({ ...prev, country }))}
          />
        )}
        {currentStep === "payment" && (
          <PaymentStep
            selected={selection.paymentMethod}
            onSelect={(method) => setSelection((prev) => ({ ...prev, paymentMethod: method }))}
          />
        )}
        {currentStep === "goal" && (
          <GoalStep selected={selection.goal} onSelect={(goal) => setSelection((prev) => ({ ...prev, goal }))} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <GradientButton onClick={handleNext} disabled={!canProceed()} size="lg" className="flex items-center gap-2">
          {currentStep === "goal" ? (
            <>
              <Plane className="w-5 h-5" />
              Start my XRPL route
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </GradientButton>
      </div>
    </div>
  )
}
