"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Send,
  ArrowDownToLine,
  Clock,
  Layers,
  ArrowRight,
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

const mockActivity = [
  {
    id: "1",
    type: "received",
    label: "Received from rUn8e...",
    amount: "+50.00 XRP",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "sent",
    label: "Sent to rPay7k...",
    amount: "-12.50 XRP",
    time: "Yesterday",
  },
  {
    id: "3",
    type: "received",
    label: "Received from rShop...",
    amount: "+5.00 XRP",
    time: "3 days ago",
  },
]

const mockObjects = [
  { id: "1", name: "Concert Ticket", category: "Ticket" },
  { id: "2", name: "Coffee Coupon", category: "Coupon" },
]

export default function WalletDashboard() {
  const router = useRouter()
  const [hasWallet, setHasWallet] = useState<boolean | null>(null)

  useEffect(() => {
    // In a real app, check for wallet existence
    const walletExists = typeof window !== "undefined" && localStorage.getItem("xrpilot_wallet")
    if (!walletExists) {
      router.replace("/pilot/wallet/onboarding")
      return
    }
    setHasWallet(true)
  }, [router])

  if (hasWallet === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 border-border/50">
        <CardContent className="pt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-5xl font-bold tracking-tight text-foreground">
            142.50
          </p>
          <p className="text-lg font-medium text-muted-foreground">XRP</p>
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
          {mockActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity yet.
            </p>
          ) : (
            mockActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    item.type === "received"
                      ? "text-green-400"
                      : "text-foreground"
                  )}
                >
                  {item.amount}
                </span>
              </div>
            ))
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
          {mockObjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No objects yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mockObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="p-4 rounded-xl border border-border/50 bg-muted/30 space-y-2"
                >
                  <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center">
                    <Layers className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {obj.name}
                  </p>
                  <Badge variant="secondary">{obj.category}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
