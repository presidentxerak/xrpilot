"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Send,
  ArrowDownToLine,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWalletStore } from "@/stores/wallet-store"
import { useBalance, useTransactionHistory } from "@/hooks/use-wallet"
import { formatXrp } from "@/lib/wallet/balance"

export default function WalletDashboard() {
  const router = useRouter()
  const isOnboarded = useWalletStore((s) => s.isOnboarded)
  const activeAddress = useWalletStore((s) => s.activeAddress)
  const network = useWalletStore((s) => s.network)

  const { accountInfo, isLoading: balanceLoading, error: balanceError } = useBalance(activeAddress)
  const { transactions, isLoading: txLoading } = useTransactionHistory(activeAddress)

  useEffect(() => {
    if (!isOnboarded || !activeAddress) {
      router.replace("/pilot/wallet/onboarding")
    }
  }, [isOnboarded, activeAddress, router])

  if (!isOnboarded || !activeAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const balanceXrp = accountInfo
    ? formatXrp(accountInfo.balance)
    : "0"

  const recentTx = transactions.slice(0, 5)

  function formatTime(timestamp: number) {
    if (!timestamp) return ""
    const diff = Date.now() - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 border-border/50">
        <CardContent className="pt-6 text-center space-y-2">
          {network === "testnet" && (
            <Badge variant="secondary" className="mb-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Testnet
            </Badge>
          )}
          <p className="text-sm text-muted-foreground">Available Balance</p>
          {balanceLoading && !accountInfo ? (
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          ) : balanceError ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                —
              </p>
              <p className="text-xs text-yellow-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {balanceError.includes("actNotFound")
                  ? "Account not yet activated. Send at least 10 XRP to activate."
                  : "Unable to load balance"}
              </p>
            </div>
          ) : (
            <>
              <p className="text-5xl font-bold tracking-tight text-foreground">
                {balanceXrp}
              </p>
              <p className="text-lg font-medium text-muted-foreground">XRP</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/pilot/wallet/app/send">
          <Button
            variant="outline"
            className="w-full min-h-[44px] gap-2 text-base"
            size="lg"
          >
            <Send className="w-5 h-5" />
            Send
          </Button>
        </Link>
        <Link href="/pilot/wallet/app/receive">
          <Button
            variant="outline"
            className="w-full min-h-[44px] gap-2 text-base"
            size="lg"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Receive
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {txLoading && recentTx.length === 0 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentTx.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity yet.
            </p>
          ) : (
            recentTx.map((tx) => {
              const isSent = tx.from === activeAddress
              return (
                <div
                  key={tx.hash}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isSent ? "bg-muted/50" : "bg-green-500/10"
                    )}>
                      {isSent ? (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {isSent ? "Sent to" : "Received from"}{" "}
                        {(isSent ? tx.to : tx.from).slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(tx.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isSent ? "text-foreground" : "text-green-400"
                    )}
                  >
                    {isSent ? "-" : "+"}{tx.amount} XRP
                  </span>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* My Objects Preview */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-muted-foreground" />
            My Objects
          </CardTitle>
          <CardDescription>
            <Link
              href="/pilot/wallet/objects"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No objects yet. Digital objects you receive will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
