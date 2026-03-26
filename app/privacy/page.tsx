import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
              <p>
                XRPilot is designed to be stateless. We do not require account creation or login. We may collect
                anonymous usage analytics to improve our service, but we do not collect personally identifiable
                information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">IP-Based Location</h2>
              <p>
                We may use your IP address to suggest your country for route recommendations. This information is
                processed locally and not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
              <p>
                We use essential cookies to ensure the website functions properly. We do not use tracking cookies or
                sell your data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Links</h2>
              <p>
                When you click affiliate links, you will be redirected to third-party websites with their own privacy
                policies. We encourage you to review their policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>If you have questions about this privacy policy, please contact us through our website.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
