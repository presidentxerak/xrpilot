"use client"

import { useState } from "react"
import Link from "next/link"
import { Wallet, ArrowDownToLine, Send, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const features = [
  {
    icon: ArrowDownToLine,
    title: "Receive Objects",
    description:
      "Receive digital objects like tickets, coupons, and collectibles directly to your wallet.",
  },
  {
    icon: Send,
    title: "Send Value",
    description:
      "Send payments to friends, family, or merchants instantly with near-zero fees.",
  },
  {
    icon: Shield,
    title: "Stay Secure",
    description:
      "Your wallet is protected by a personal PIN. Only you can access your funds and objects.",
  },
]

export default function WalletEntryPage() {
  // In a real app, this would check local storage or auth state
  const [hasWallet] = useState(false)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm text-primary">
          <Wallet className="w-4 h-4" />
          Pilot Wallet
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Your{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Digital Wallet
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
          A simple, secure place to manage your digital value and objects on the
          XRP Ledger. No complexity, just control.
        </p>
        <div className="pt-4">
          <Link href={hasWallet ? "/pilot/wallet/app" : "/pilot/wallet/onboarding"}>
            <Button
              size="lg"
              className="min-h-[44px] px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              {hasWallet ? "Open Wallet" : "Create Wallet"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
