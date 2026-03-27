"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpDown, Info } from "lucide-react"
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

const tokens = [
  { symbol: "XRP", name: "XRP", balance: 142.5 },
  { symbol: "USD", name: "US Dollar", balance: 0 },
  { symbol: "EUR", name: "Euro", balance: 0 },
]

const mockRate = 0.52 // 1 XRP = 0.52 USD

export default function SwapPage() {
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState("")
  const [slippage] = useState(0.5) // 0.5%

  const parsedFrom = parseFloat(fromAmount) || 0
  const estimatedReceive = parsedFrom * mockRate
  const minimumReceive = estimatedReceive * (1 - slippage / 100)
  const isValid = parsedFrom > 0 && parsedFrom <= fromToken.balance

  const handleSwapDirection = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
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

      <h1 className="text-2xl font-bold text-foreground">Swap</h1>

      <Card className="border-border/50">
        <CardContent className="pt-6 space-y-4">
          {/* From */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                From
              </label>
              <span className="text-xs text-muted-foreground">
                Balance: {fromToken.balance.toFixed(2)} {fromToken.symbol}
              </span>
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="min-h-[44px] flex-1"
                min="0"
                step="0.01"
              />
              <div className="min-h-[44px] px-4 rounded-md border border-border bg-muted/30 flex items-center gap-2 text-sm font-medium text-foreground min-w-[80px] justify-center">
                {fromToken.symbol}
              </div>
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="min-h-[44px] min-w-[44px] rounded-full"
              onClick={handleSwapDirection}
            >
              <ArrowUpDown className="w-5 h-5" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">To</label>
            <div className="flex gap-3">
              <div className="min-h-[44px] flex-1 px-4 rounded-md border border-border bg-muted/10 flex items-center text-foreground">
                {parsedFrom > 0 ? estimatedReceive.toFixed(2) : "0.00"}
              </div>
              <div className="min-h-[44px] px-4 rounded-md border border-border bg-muted/30 flex items-center gap-2 text-sm font-medium text-foreground min-w-[80px] justify-center">
                {toToken.symbol}
              </div>
            </div>
          </div>

          {/* Rate & Slippage Info */}
          {parsedFrom > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-foreground">
                  1 {fromToken.symbol} = {mockRate} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  You&apos;ll receive at least
                </span>
                <span className="text-foreground font-medium">
                  {minimumReceive.toFixed(2)} {toToken.symbol}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Price may change slightly before the swap completes.
                Maximum difference: {slippage}%.
              </p>
            </div>
          )}

          <Button
            disabled={!isValid}
            size="lg"
            className={cn(
              "w-full min-h-[44px]",
              isValid
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
                : ""
            )}
          >
            Swap
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
