import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AlertTriangle } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Disclaimer</h1>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">No Financial Advice</h2>
              <p>
                The information provided by XRPilot is for general informational purposes only. Nothing on this website
                constitutes financial, investment, legal, or tax advice. You should consult with a qualified
                professional before making any financial decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Services</h2>
              <p>
                XRPilot provides navigation and links to third-party platforms including exchanges, wallets, and
                marketplaces. We do not control these services and are not responsible for their actions, policies, or
                any losses you may incur while using them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">No Custody</h2>
              <p>
                XRPilot does not hold, custody, or manage any cryptocurrency assets. We never have access to your funds,
                private keys, or personal financial information beyond what you choose to share with third-party
                services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Affiliate Relationships</h2>
              <p>
                XRPilot may receive compensation through affiliate links when you sign up for or use services we
                recommend. This does not affect the routes we suggest, which are based on objective criteria like fees,
                speed, and availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Risk Warning</h2>
              <p>
                Cryptocurrency investments carry significant risks including total loss of capital. Prices can be highly
                volatile. Past performance is not indicative of future results. Only invest what you can afford to lose.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
