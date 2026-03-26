"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Key,
  Clock,
  AlertTriangle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SecurityPage() {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [pinMessage, setPinMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [autoLock, setAutoLock] = useState("5")
  const [showRecoveryKey, setShowRecoveryKey] = useState(false)

  const handleChangePin = () => {
    if (currentPin.length < 4) {
      setPinMessage({ type: "error", text: "Please enter your current PIN." })
      return
    }
    if (newPin.length < 6) {
      setPinMessage({
        type: "error",
        text: "New PIN must be 6 digits.",
      })
      return
    }
    if (newPin !== confirmNewPin) {
      setPinMessage({
        type: "error",
        text: "New PINs do not match.",
      })
      return
    }
    // In a real app, verify current PIN and update
    setPinMessage({ type: "success", text: "PIN updated successfully." })
    setCurrentPin("")
    setNewPin("")
    setConfirmNewPin("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground">
          Manage your wallet security settings.
        </p>
      </div>

      {/* Change PIN */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Change PIN</CardTitle>
              <CardDescription>
                Update your 6-digit wallet PIN.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current PIN
            </label>
            <Input
              type="password"
              placeholder="Enter current PIN"
              value={currentPin}
              onChange={(e) => {
                setCurrentPin(e.target.value)
                setPinMessage(null)
              }}
              maxLength={6}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New PIN
            </label>
            <Input
              type="password"
              placeholder="Enter new 6-digit PIN"
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value)
                setPinMessage(null)
              }}
              maxLength={6}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm New PIN
            </label>
            <Input
              type="password"
              placeholder="Confirm new PIN"
              value={confirmNewPin}
              onChange={(e) => {
                setConfirmNewPin(e.target.value)
                setPinMessage(null)
              }}
              maxLength={6}
              className="min-h-[44px]"
            />
          </div>
          {pinMessage && (
            <p
              className={cn(
                "text-sm",
                pinMessage.type === "error"
                  ? "text-destructive"
                  : "text-green-400"
              )}
            >
              {pinMessage.text}
            </p>
          )}
          <Button
            onClick={handleChangePin}
            size="lg"
            className="w-full min-h-[44px]"
          >
            Update PIN
          </Button>
        </CardContent>
      </Card>

      {/* Auto-Lock Timer */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Auto-Lock Timer</CardTitle>
              <CardDescription>
                Automatically lock your wallet after a period of inactivity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={autoLock} onValueChange={setAutoLock}>
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 minute</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Export Recovery Key */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Recovery Key</CardTitle>
              <CardDescription>
                Your recovery key lets you restore your wallet if you lose
                access to this device.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full min-h-[44px]"
              >
                Export Recovery Key
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Important Warning
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 text-left">
                  <span className="block">
                    Your recovery key gives full access to your wallet and all
                    its contents. Anyone with this key can control your funds.
                  </span>
                  <span className="block font-medium text-foreground">
                    Never share your recovery key with anyone. Store it in a
                    safe, private place.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>

              {showRecoveryKey && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="font-mono text-sm break-all text-foreground select-all">
                    sEdV19BLCjTYeCpeYWbCgt3ufoi5Lkq
                  </p>
                </div>
              )}

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowRecoveryKey(false)}>
                  Close
                </AlertDialogCancel>
                {!showRecoveryKey && (
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      setShowRecoveryKey(true)
                    }}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white border-0"
                  >
                    I Understand, Show Key
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
