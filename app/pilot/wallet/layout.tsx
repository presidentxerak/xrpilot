"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DesktopNav } from "@/components/navigation"
import {
  Home,
  Layers,
  ArrowLeftRight,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const walletTabs = [
  { href: "/pilot/wallet/app", label: "Home", icon: Home },
  { href: "/pilot/wallet/objects", label: "Objects", icon: Layers },
  { href: "/pilot/wallet/app/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/pilot/wallet/security", label: "Settings", icon: Settings },
]

const sidebarLinks = [
  { href: "/pilot/wallet/app", label: "Dashboard" },
  { href: "/pilot/wallet/app/send", label: "Send" },
  { href: "/pilot/wallet/app/receive", label: "Receive" },
  { href: "/pilot/wallet/app/swap", label: "Swap" },
  { href: "/pilot/wallet/objects", label: "My Objects" },
  { href: "/pilot/wallet/learn", label: "Learn" },
  { href: "/pilot/wallet/security", label: "Security" },
]

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />

      {/* Breadcrumb */}
      <div className="pt-20 md:pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              href="/pilot"
              className="hover:text-primary transition-colors min-h-[44px] flex items-center"
            >
              Pilot
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Wallet</span>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 pr-8 py-6 gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 pb-28 md:pb-12">{children}</main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2 px-4">
          {walletTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] min-h-[44px] justify-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
