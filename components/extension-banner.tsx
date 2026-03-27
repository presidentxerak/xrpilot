"use client"

import { useState, useEffect } from "react"
import {
  Chrome,
  Globe,
  Download,
  Smartphone,
  Monitor,
  Shield,
  Zap,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type BrowserType = "chrome" | "safari" | "firefox" | "other"

function detectBrowser(): BrowserType {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("chrome") && !ua.includes("edg")) return "chrome"
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari"
  if (ua.includes("firefox")) return "firefox"
  return "other"
}

const extensionFeatures = [
  {
    icon: Zap,
    title: "Quick Access",
    description: "Open your wallet with one click from any website",
  },
  {
    icon: Shield,
    title: "Secure Signing",
    description: "Approve transactions without leaving the page",
  },
  {
    icon: Globe,
    title: "Web3 Ready",
    description: "Connect to XRPL apps and services seamlessly",
  },
]

export function ExtensionBanner() {
  const [browser, setBrowser] = useState<BrowserType>("other")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setBrowser(detectBrowser())
    const wasDismissed = localStorage.getItem("xrpilot_ext_dismissed")
    if (wasDismissed) setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("xrpilot_ext_dismissed", "true")
  }

  if (dismissed) return null

  const browserName = browser === "chrome" ? "Chrome" : browser === "safari" ? "Safari" : browser === "firefox" ? "Firefox" : "your browser"
  const BrowserIcon = browser === "chrome" ? Chrome : Globe

  return (
    <section className="py-12">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-400/5">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <CardContent className="pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: CTA */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                <Download className="w-3.5 h-3.5" />
                Browser Extension
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Take Pilot{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                    everywhere
                  </span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Install the Pilot extension for {browserName} and access your
                  wallet from any website. Sign transactions, check your balance,
                  and manage your objects — all without leaving the page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="min-h-[48px] gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity rounded-xl"
                >
                  <BrowserIcon className="w-5 h-5" />
                  Add to {browserName}
                </Button>

                {browser !== "safari" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[48px] gap-2 rounded-xl"
                  >
                    <Globe className="w-5 h-5" />
                    Safari
                  </Button>
                )}
                {browser !== "chrome" && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[48px] gap-2 rounded-xl"
                  >
                    <Chrome className="w-5 h-5" />
                    Chrome
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile PWA coming soon
                </div>
              </div>
            </div>

            {/* Right: Features */}
            <div className="space-y-4">
              {extensionFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
