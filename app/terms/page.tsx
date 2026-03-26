import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using XRPilot, you agree to be bound by these Terms of Service. If you do not agree to
                these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Service Description</h2>
              <p>
                XRPilot is an informational navigation tool that helps users find routes from fiat currency to the XRP
                Ledger ecosystem. We provide recommendations and redirect users to third-party services but do not
                provide financial services ourselves.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">User Responsibilities</h2>
              <p>
                You are responsible for conducting your own research before using any third-party service. You
                acknowledge that cryptocurrency carries significant risks and that you are solely responsible for your
                investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Limitation of Liability</h2>
              <p>
                XRPilot shall not be liable for any direct, indirect, incidental, or consequential damages arising from
                your use of our service or any third-party service we recommend.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service after changes
                constitutes acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
