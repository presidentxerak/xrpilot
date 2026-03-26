"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plane, Home, Compass, BookOpen, Info, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pilot", label: "Pilot", icon: Compass },
  { href: "/pilot/wallet", label: "Wallet", icon: Wallet },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <Plane className="w-5 h-5 text-background" />
          </div>
          <span className="text-xl font-bold text-foreground">XRPilot</span>
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href || pathname.startsWith(item.href + "/") ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pilot/wallet"
            className="px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            Open Wallet
          </Link>
          <Link
            href="/pilot"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-shadow animate-gradient"
          >
            Start Flying
          </Link>
        </div>
      </nav>
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px]",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
