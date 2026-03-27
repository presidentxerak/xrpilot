"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, ShieldCheck, PartyPopper, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useWalletStore } from "@/stores/wallet-store"

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const createWallet = useWalletStore((s) => s.createWallet)
  const setOnboarded = useWalletStore((s) => s.setOnboarded)
  const unlock = useWalletStore((s) => s.unlock)

  const progressValue = (step / TOTAL_STEPS) * 100

  const handlePinConfirm = async () => {
    if (pin.length < 6) {
      setPinError("Please enter all 6 digits.")
      return
    }
    if (confirmPin.length < 6) {
      setPinError("Please confirm your PIN.")
      return
    }
    if (pin !== confirmPin) {
      setPinError("PINs do not match. Please try again.")
      setConfirmPin("")
      return
    }
    setPinError("")
    setIsCreating(true)

    try {
      await createWallet(pin, "My Wallet")
      setOnboarded()
      unlock(pin)
      setStep(3)
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Failed to create wallet."
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleFinish = () => {
    router.push("/pilot/wallet/app")
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pt-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} />
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <Card className="border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Pilot
                </span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We are going to set up your personal wallet in just a moment.
                It only takes a few seconds and you will be ready to send,
                receive, and manage your digital value.
              </p>
            </div>
            <Button
              onClick={() => setStep(2)}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: PIN Setup */}
      {step === 2 && (
        <Card className="border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Secure Your Wallet
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choose a 6-digit PIN to protect your wallet. You will use this
                PIN to approve payments and access your settings.
              </p>
            </div>

            {/* PIN Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Create PIN
                </label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Confirm PIN
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={confirmPin}
                    onChange={(value) => {
                      setConfirmPin(value)
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
              </div>

              {pinError && (
                <p className="text-sm text-destructive">{pinError}</p>
              )}
            </div>

            <Button
              onClick={handlePinConfirm}
              disabled={isCreating}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                "Set PIN"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: All Set */}
      {step === 3 && (
        <Card className="border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                You&apos;re All Set!
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your wallet is ready. You can now send and receive payments,
                collect digital objects, and explore everything the XRP Ledger
                has to offer.
              </p>
            </div>
            <Button
              onClick={handleFinish}
              size="lg"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0 hover:opacity-90 transition-opacity"
            >
              Open My Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
