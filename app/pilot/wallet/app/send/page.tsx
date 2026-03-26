"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Info,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const AVAILABLE_BALANCE = 142.5

export default function SendPage() {
  const [step, setStep] = useState<"form" | "confirm" | "done">("form")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [destinationTag, setDestinationTag] = useState("")

  const parsedAmount = parseFloat(amount) || 0
  const remainingBalance = AVAILABLE_BALANCE - parsedAmount
  const isValid =
    recipient.length > 0 && parsedAmount > 0 && parsedAmount <= AVAILABLE_BALANCE

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment Sent</h2>
        <p className="text-muted-foreground">
          You sent {parsedAmount.toFixed(2)} XRP to {recipient.slice(0, 8)}...
        </p>
        <Link href="/pilot/wallet/app">
          <Button size="lg" className="min-h-[44px]">
            Back to Wallet
          </Button>
        </Link>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setStep("form")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Confirm Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">You are sending</p>
              <p className="text-4xl font-bold text-foreground">
                {parsedAmount.toFixed(2)}{" "}
                <span className="text-lg text-muted-foreground">XRP</span>
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="text-foreground font-mono text-xs">
                  {recipient.slice(0, 12)}...{recipient.slice(-6)}
                </span>
              </div>
              {destinationTag && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Destination Tag
                  </span>
                  <span className="text-foreground">{destinationTag}</span>
                </div>
              )}
              <div className="border-t border-border/50 pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  After this, you will have
                </span>
                <span className="text-foreground font-semibold">
                  {remainingBalance.toFixed(2)} XRP
                </span>
              </div>
            </div>

            <Button
              onClick={() => setStep("done")}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

      <h1 className="text-2xl font-bold text-foreground">Send XRP</h1>

      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Recipient Address
            </label>
            <Input
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="min-h-[44px] font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Amount
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-h-[44px] pr-16"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                XRP
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {AVAILABLE_BALANCE.toFixed(2)} XRP
            </p>
          </div>

          {/* Destination Tag */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">
                Destination Tag
              </label>
              <span className="text-xs text-muted-foreground">(optional)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Some recipients (like exchanges) require a destination tag
                      to identify your payment. Check with the recipient if
                      unsure.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              placeholder="e.g. 12345"
              value={destinationTag}
              onChange={(e) => setDestinationTag(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <Button
            onClick={() => setStep("confirm")}
            disabled={!isValid}
            size="lg"
            className={cn(
              "w-full min-h-[44px]",
              isValid
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
                : ""
            )}
          >
            Review Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
