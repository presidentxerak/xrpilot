"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Info,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useWalletStore } from "@/stores/wallet-store"
import { useBalance, useSendXrp } from "@/hooks/use-wallet"
import { formatXrp, xrpToDrops } from "@/lib/wallet/balance"
import { getWalletSecret } from "@/lib/wallet/storage"

export default function SendPage() {
  const activeAddress = useWalletStore((s) => s.activeAddress)
  const { accountInfo } = useBalance(activeAddress)

  const [step, setStep] = useState<"form" | "pin" | "confirm" | "sending" | "done" | "error">("form")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [destinationTag, setDestinationTag] = useState("")
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [txHash, setTxHash] = useState("")
  const [sendError, setSendError] = useState("")

  const { send } = useSendXrp()

  const balanceXrp = accountInfo ? parseFloat(formatXrp(accountInfo.balance)) : 0
  const reserveXrp = accountInfo ? 1 + accountInfo.ownerCount * 0.2 : 1
  const availableXrp = Math.max(0, balanceXrp - reserveXrp)
  const parsedAmount = parseFloat(amount) || 0
  const remainingBalance = availableXrp - parsedAmount
  const isValid =
    recipient.startsWith("r") &&
    recipient.length >= 25 &&
    parsedAmount > 0 &&
    parsedAmount <= availableXrp

  const handlePinSubmit = async () => {
    if (pin.length < 6) {
      setPinError("Please enter your 6-digit PIN.")
      return
    }

    try {
      const secrets = await getWalletSecret(activeAddress!, pin)
      setStep("sending")
      setPinError("")

      const result = await send({
        fromSeed: secrets.seed,
        to: recipient,
        amountInDrops: xrpToDrops(parsedAmount.toString()),
        destinationTag: destinationTag ? parseInt(destinationTag, 10) : undefined,
      })

      if (result.status === "success") {
        setTxHash(result.hash)
        setStep("done")
      } else {
        setSendError(`Transaction failed: ${result.resultCode}`)
        setStep("error")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      if (message.includes("Decryption failed") || message.includes("Incorrect PIN")) {
        setPinError("Incorrect PIN. Please try again.")
        setPin("")
        setStep("pin")
      } else {
        setSendError(message)
        setStep("error")
      }
    }
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment Failed</h2>
        <p className="text-muted-foreground max-w-sm">{sendError}</p>
        <Button
          onClick={() => { setStep("form"); setSendError(""); setPin("") }}
          size="lg"
          className="min-h-[44px]"
        >
          Try Again
        </Button>
      </div>
    )
  }

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
        {txHash && (
          <p className="text-xs text-muted-foreground font-mono break-all max-w-sm">
            TX: {txHash.slice(0, 16)}...{txHash.slice(-16)}
          </p>
        )}
        <Link href="/pilot/wallet/app">
          <Button size="lg" className="min-h-[44px]">
            Back to Wallet
          </Button>
        </Link>
      </div>
    )
  }

  if (step === "sending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-xl font-bold text-foreground">Sending Payment...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while your transaction is submitted to the ledger.
        </p>
      </div>
    )
  }

  if (step === "pin") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => { setStep("confirm"); setPin(""); setPinError("") }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Enter PIN to Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Enter your 6-digit PIN to authorize this payment of {parsedAmount.toFixed(2)} XRP.
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={(value) => {
                  setPin(value)
                  setPinError("")
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-11 h-11" />
                  <InputOTPSlot index={1} className="w-11 h-11" />
                  <InputOTPSlot index={2} className="w-11 h-11" />
                  <InputOTPSlot index={3} className="w-11 h-11" />
                  <InputOTPSlot index={4} className="w-11 h-11" />
                  <InputOTPSlot index={5} className="w-11 h-11" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {pinError && (
              <p className="text-sm text-destructive text-center">{pinError}</p>
            )}
            <Button
              onClick={handlePinSubmit}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5 mr-2" />
              Confirm &amp; Send
            </Button>
          </CardContent>
        </Card>
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
              onClick={() => setStep("pin")}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5 mr-2" />
              Continue
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
              Available: {availableXrp.toFixed(2)} XRP
              {balanceXrp > 0 && (
                <span className="text-muted-foreground/60">
                  {" "}(total {balanceXrp.toFixed(2)}, {reserveXrp} XRP reserved)
                </span>
              )}
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
