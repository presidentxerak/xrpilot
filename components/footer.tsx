import Link from "next/link"
import { Plane } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center animate-gradient">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">XRPilot</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Your copilot into the XRPL ecosystem. Navigate from fiat to XRP Ledger with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Navigate</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pilot" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Start Pilot
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-2">
            <p>XRPilot does not sell, custody or manage crypto assets.</p>
            <p>We provide navigation and redirection to third party platforms only.</p>
            <p className="font-medium">This is not financial advice.</p>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} XRPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
