"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DesktopNav } from "@/components/navigation"
import { XrplChatbot } from "@/components/xrpl-chatbot"
import {
  Home,
  Layers,
  ArrowLeftRight,
  Settings,
  ChevronRight,
  GraduationCap,
  MessageCircle,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

const walletTabs = [
  { href: "/pilot/wallet/app", label: "Home", icon: Home },
  { href: "/pilot/wallet/objects", label: "Objects", icon: Layers },
  { href: "/pilot/wallet/app/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/pilot/wallet/learn", label: "Learn", icon: GraduationCap },
  { href: "/pilot/wallet/security", label: "Settings", icon: Settings },
]

const sidebarLinks = [
  { href: "/pilot/wallet/app", label: "Dashboard", icon: Home },
  { href: "/pilot/wallet/app/send", label: "Send", icon: undefined },
  { href: "/pilot/wallet/app/receive", label: "Receive", icon: undefined },
  { href: "/pilot/wallet/app/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/pilot/wallet/objects", label: "My Objects", icon: Layers },
  { href: "/pilot/wallet/learn", label: "Learn", icon: GraduationCap },
  { href: "/pilot/wallet/security", label: "Security", icon: Settings },
]

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/pilot/wallet"

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
            <Link
              href="/pilot/wallet"
              className={cn(
                "min-h-[44px] flex items-center transition-colors",
                isLandingPage ? "text-foreground" : "hover:text-primary"
              )}
            >
              Wallet
            </Link>
            {!isLandingPage && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground capitalize">
                  {pathname.split("/").pop()?.replace(/-/g, " ")}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-6">
        {/* Desktop Sidebar — only on inner pages */}
        {!isLandingPage && (
          <aside className="hidden md:flex flex-col w-56 shrink-0 pr-8 py-6 gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2",
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
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 py-6 pb-28 md:pb-12",
            isLandingPage && "max-w-5xl mx-auto"
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2 px-2">
          {/* Wallet landing link */}
          <Link
            href="/pilot/wallet"
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] justify-center",
              pathname === "/pilot/wallet" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-medium">Wallet</span>
          </Link>

          {walletTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] justify-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Chatbot */}
      <XrplChatbot />
    </div>
  )
}
