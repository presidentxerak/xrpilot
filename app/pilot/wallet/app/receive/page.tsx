"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const WALLET_ADDRESS = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"

export default function ReceivePage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = WALLET_ADDRESS
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My XRP Address",
        text: WALLET_ADDRESS,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/pilot/wallet/app"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Wallet
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Receive</h1>

      <Card className="border-border/50">
        <CardHeader className="text-center">
          <CardTitle>Your Wallet Address</CardTitle>
          <CardDescription>
            Share this address with anyone who wants to send you XRP or digital
            objects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Display */}
          <div className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
            <p className="font-mono text-base md:text-lg break-all text-foreground leading-relaxed select-all">
              {WALLET_ADDRESS}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="lg"
              className="min-h-[44px] gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="min-h-[44px] gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destination Tag Info */}
      <Card className="border-border/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                About Destination Tags
              </p>
              <p className="text-sm text-muted-foreground">
                Your personal wallet does not require a destination tag.
                Destination tags are mainly used by exchanges and services to
                identify which customer a payment belongs to. If someone asks
                for your destination tag, let them know you have a personal
                wallet and one is not needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
