"use client"

import type React from "react"

import { ExternalLink, Clock, AlertTriangle, ChevronRight, RefreshCw, Plane, MessageCircle } from "lucide-react"
import type { Route, UserSelection } from "@/lib/types"
import { getCountryName, getGoalLabel, getPaymentLabel } from "@/lib/route-calculator"
import { cn } from "@/lib/utils"
import { GradientButton } from "@/components/gradient-button"

interface RouteResultsProps {
  selection: UserSelection
  routes: Route[]
  onRestart: () => void
}

export function RouteResults({ selection, routes, onRestart }: RouteResultsProps) {
  const mainRoute = routes[0]
  const alternativeRoutes = routes.slice(1)

  if (!mainRoute) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No routes found for your selection.</p>
        <GradientButton onClick={onRestart}>Try Different Options</GradientButton>
      </div>
    )
  }

  const stepIcons: Record<string, React.ElementType> = {
    onramp: () => <span className="text-xl">💳</span>,
    exchange: () => <span className="text-xl">🏦</span>,
    wallet: () => <span className="text-xl">👛</span>,
    marketplace: () => <span className="text-xl">🖼️</span>,
    platform: () => <span className="text-xl">🔄</span>,
  }

  return (
    <div className="space-y-8">
      {/* Main Route Card */}
      <div className="bg-card rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center animate-gradient">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Your Flight Route</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {getCountryName(selection.country)} → {getGoalLabel(selection.goal)}
            </h2>
            <p className="text-muted-foreground mt-1">Payment: {getPaymentLabel(selection.paymentMethod)}</p>
          </div>
          <button
            onClick={onRestart}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Restart route"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Route Steps */}
        <div className="relative pl-8 space-y-0">
          {mainRoute.steps.map((step, index) => {
            const StepIcon = stepIcons[step.type]
            const isLast = index === mainRoute.steps.length - 1
            return (
              <div key={index} className="relative pb-8 last:pb-0">
                {/* Vertical line */}
                {!isLast && (
                  <div className="absolute left-[-20px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent" />
                )}
                {/* Step number */}
                <div className="absolute left-[-32px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>

                <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                      <StepIcon />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{step.type}</p>
                      <h3 className="font-semibold text-foreground">{step.serviceName}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{step.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {step.timeEstimate}
                    </span>
                    {step.riskWarning && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        {step.riskWarning}
                      </span>
                    )}
                  </div>

                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white text-sm font-medium hover:shadow-lg transition-shadow animate-gradient"
                  >
                    Go to {step.serviceName}
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs opacity-75">(Partner link)</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Route Summary */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <div className="bg-muted/50 px-4 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Est. Fees</p>
            <p className="font-semibold text-foreground">{mainRoute.fees}</p>
          </div>
          <div className="bg-muted/50 px-4 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Est. Time</p>
            <p className="font-semibold text-foreground">{mainRoute.speed}</p>
          </div>
          <div className="bg-muted/50 px-4 py-2 rounded-xl">
            <p className="text-xs text-muted-foreground">Complexity</p>
            <p
              className={cn(
                "font-semibold",
                mainRoute.complexity === "Easy" && "text-green-600",
                mainRoute.complexity === "Medium" && "text-amber-600",
                mainRoute.complexity === "Hard" && "text-red-600",
              )}
            >
              {mainRoute.complexity}
            </p>
          </div>
        </div>
      </div>

      {/* Pilot Notes */}
      <div className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-400/5 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Pilot Notes</h3>
        </div>
        <p className="text-muted-foreground">
          {selection.paymentMethod === "card" && selection.goal === "nfts"
            ? "Because you selected credit card and NFTs, this route is the fastest for you. Alternative routes may require longer verification times."
            : selection.paymentMethod === "bank"
              ? "Bank transfers often have lower fees but may take 1-3 business days to process. Consider card payment for faster access."
              : "This route has been optimized based on your location and payment preference. Check alternative routes if you need different trade-offs."}
        </p>
      </div>

      {/* Alternative Routes */}
      {alternativeRoutes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Alternative Routes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow space-y-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {route.steps.map((step, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {step.serviceName}
                      {i < route.steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-muted rounded-lg">Fees: {route.fees}</span>
                  <span className="px-2 py-1 bg-muted rounded-lg">Time: {route.speed}</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-lg",
                      route.complexity === "Easy" && "bg-green-100 text-green-700",
                      route.complexity === "Medium" && "bg-amber-100 text-amber-700",
                      route.complexity === "Hard" && "bg-red-100 text-red-700",
                    )}
                  >
                    {route.complexity}
                  </span>
                </div>
                <button className="w-full py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                  Use this route
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Tutorial */}
      <div className="bg-card rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-semibold text-foreground">How to complete your route (Beginner friendly)</h3>
        <div className="space-y-3">
          {[
            {
              step: 1,
              title: `Create account on ${mainRoute.steps[0]?.serviceName}`,
              desc: "Sign up with your email and complete the registration process.",
            },
            {
              step: 2,
              title: "Verify your identity",
              desc: "Most platforms require KYC verification. Have your ID ready.",
            },
            { step: 3, title: "Buy XRP", desc: "Use your selected payment method to purchase XRP." },
            { step: 4, title: "Set up your wallet", desc: "Download and set up your XRPL wallet for secure storage." },
            { step: 5, title: "Interact with XRPL", desc: "Transfer your XRP and start exploring the ecosystem." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-3 rounded-xl bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{item.step}</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Restart Button (Mobile) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onRestart}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white shadow-xl flex items-center justify-center animate-gradient"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
