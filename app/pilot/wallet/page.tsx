"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Wallet,
  ArrowDownToLine,
  Send,
  Shield,
  ArrowRight,
  Zap,
  Clock,
  Globe,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useWalletStore } from "@/stores/wallet-store"
import { WalletTutorial } from "@/components/wallet-tutorial"
import { ExtensionBanner } from "@/components/extension-banner"

const features = [
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Create your wallet in 60 seconds. No email, no ID, no crypto purchase needed.",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: Send,
    title: "Send Anywhere",
    description: "Send payments globally in 3-5 seconds. Fees under $0.01. Works 24/7.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: ArrowDownToLine,
    title: "Collect Objects",
    description: "Receive tickets, art, coupons, and collectibles directly in your wallet.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "AES-256 encryption. Your keys never leave your device. Only you have access.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
]

const stats = [
  { icon: Clock, value: "3-5s", label: "Settlement" },
  { icon: TrendingUp, value: "<$0.01", label: "Per transaction" },
  { icon: Globe, value: "24/7", label: "Availability" },
  { icon: Users, value: "5M+", label: "XRPL accounts" },
]

const comparisons = [
  { label: "Create account", pilot: "Free, instant", others: "Buy crypto first" },
  { label: "Send money", pilot: "3-5 seconds", others: "Minutes to hours" },
  { label: "Fees", pilot: "< $0.01", others: "$1 - $50+" },
  { label: "Jargon", pilot: "Plain language", others: "Crypto terminology" },
  { label: "Recovery", pilot: "Simple backup", others: "12-24 word phrase" },
]

export default function WalletEntryPage() {
  const isOnboarded = useWalletStore((s) => s.isOnboarded)
  const activeAddress = useWalletStore((s) => s.activeAddress)
  const hasWallet = isOnboarded && !!activeAddress
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="text-center space-y-8 pt-8 pb-16">
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm text-primary transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Wallet className="w-4 h-4" />
          Pilot Wallet
        </div>

        <h1
          className={cn(
            "text-4xl md:text-6xl font-bold leading-tight transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Your money,{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            simplified
          </span>
        </h1>

        <p
          className={cn(
            "text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          The first wallet designed for humans, not crypto experts.
          Create a wallet, get activated for free, and start sending in under a minute.
        </p>

        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Link href={hasWallet ? "/pilot/wallet/app" : "/pilot/wallet/onboarding"}>
            <Button
              size="lg"
              className="min-h-[52px] px-8 text-base bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity rounded-xl animate-gradient"
            >
              {hasWallet ? "Open Wallet" : "Create My Wallet — Free"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="min-h-[52px] px-8 text-base rounded-xl"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-6 pt-4 transition-all duration-700 delay-400",
            mounted ? "opacity-100" : "opacity-0"
          )}
        >
          {[
            "No crypto needed to start",
            "Free activation",
            "3-5 second payments",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 border-y border-border/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center space-y-2">
                <Icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No jargon, no complexity. Just a wallet that works the way you expect.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors group"
              >
                <CardHeader>
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 group-hover:scale-110 transition-transform",
                      feature.gradient
                    )}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Tutorial */}
      <div id="how-it-works">
        <WalletTutorial />
      </div>

      {/* Comparison table */}
      <section className="py-16">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Pilot
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground">
            See how we compare to other crypto wallets
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-muted/30 px-6 py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground" />
              <span className="text-sm font-bold text-primary text-center">
                Pilot
              </span>
              <span className="text-sm font-medium text-muted-foreground text-center">
                Others
              </span>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "grid grid-cols-3 px-6 py-4 items-center",
                  i < comparisons.length - 1 ? "border-b border-border/50" : ""
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  {row.label}
                </span>
                <span className="text-sm text-center font-medium text-green-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {row.pilot}
                </span>
                <span className="text-sm text-center text-muted-foreground">
                  {row.others}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extension Banner */}
      <ExtensionBanner />

      {/* Final CTA */}
      <section className="py-16 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Ready to get started?
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Create your wallet in 60 seconds. No crypto knowledge needed.
          We handle the technical stuff so you don't have to.
        </p>
        <Link href={hasWallet ? "/pilot/wallet/app" : "/pilot/wallet/onboarding"}>
          <Button
            size="lg"
            className="min-h-[52px] px-10 text-base bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity rounded-xl animate-gradient"
          >
            {hasWallet ? "Open My Wallet" : "Create My Wallet — Free"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  )
}
