"use client"

import { useState, useEffect } from "react"
import {
  Wallet,
  Shield,
  Send,
  ArrowDownToLine,
  Coins,
  Globe,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TutorialStep {
  icon: React.ElementType
  title: string
  description: string
  detail: string
  color: string
}

const steps: TutorialStep[] = [
  {
    icon: Wallet,
    title: "Create Your Wallet",
    description: "One tap, no crypto knowledge needed",
    detail:
      "Your wallet is created instantly on your device. No email, no password, no ID verification. Just a 6-digit PIN to keep it secure.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Coins,
    title: "Free Activation",
    description: "We pay the activation fee for you",
    detail:
      "Most crypto wallets require you to buy currency first. With Pilot, we activate your wallet for free so you can start receiving right away.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: ArrowDownToLine,
    title: "Receive Instantly",
    description: "Share your address, get paid in seconds",
    detail:
      "Copy your unique address or share it directly. Payments arrive in 3-5 seconds — faster than any bank transfer.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Send,
    title: "Send With Confidence",
    description: "Review everything before you confirm",
    detail:
      "Enter a recipient, an amount, and confirm with your PIN. You always see exactly what you are sending and what remains in your wallet.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    title: "Your Keys, Your Control",
    description: "Military-grade encryption on your device",
    detail:
      "Your wallet keys are encrypted with AES-256 and never leave your device. Export your recovery key anytime to back up your wallet.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Join the XRP Ledger",
    description: "A global network, open to everyone",
    detail:
      "The XRP Ledger is a decentralized network processing payments worldwide. No middlemen, near-zero fees, 24/7 availability.",
    color: "from-pink-500 to-pink-600",
  },
]

export function WalletTutorial() {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 150)
    return () => clearTimeout(timer)
  }, [activeStep])

  const goTo = (index: number) => {
    setDirection(index > activeStep ? "next" : "prev")
    setActiveStep(index)
  }

  const goNext = () => {
    if (activeStep < steps.length - 1) {
      setDirection("next")
      setActiveStep((s) => s + 1)
    }
  }

  const goPrev = () => {
    if (activeStep > 0) {
      setDirection("prev")
      setActiveStep((s) => s - 1)
    }
  }

  const step = steps[activeStep]
  const Icon = step.icon

  return (
    <section className="py-16">
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-sm text-primary">
          <Sparkles className="w-4 h-4" />
          How It Works
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          From zero to wallet in{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            60 seconds
          </span>
        </h2>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => {
          const StepIcon = s.icon
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 min-h-[44px]",
                i === activeStep
                  ? "bg-primary/10 text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <StepIcon className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">
                {s.title}
              </span>
              {i === activeStep && (
                <span className="md:hidden text-xs font-medium">
                  {i + 1}/{steps.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active step card */}
      <div className="max-w-2xl mx-auto">
        <div
          className={cn(
            "rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
            isVisible
              ? "opacity-100 translate-y-0"
              : direction === "next"
                ? "opacity-0 translate-y-4"
                : "opacity-0 -translate-y-4"
          )}
        >
          {/* Animated icon header */}
          <div
            className={cn(
              "bg-gradient-to-r p-8 flex items-center justify-center",
              step.color
            )}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite]">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="p-8 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step {activeStep + 1} of {steps.length}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
            <p className="text-lg text-primary font-medium">
              {step.description}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {step.detail}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={goPrev}
            disabled={activeStep === 0}
            className="min-h-[44px] gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300 min-h-[12px]",
                  i === activeStep
                    ? "w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={goNext}
            disabled={activeStep === steps.length - 1}
            className="min-h-[44px] gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
