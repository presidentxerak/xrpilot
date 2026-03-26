import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Plane, Users, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center mb-4 animate-gradient">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About XRPilot</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your trusted navigation tool for the XRP Ledger ecosystem.
            </p>
          </div>

          <div className="space-y-12">
            <section className="bg-card rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                XRPilot was created to solve a simple problem: navigating the crypto ecosystem is confusing. With
                hundreds of exchanges, wallets, and platforms, finding the right path from fiat money to your XRPL goals
                can feel overwhelming. We act as your personal copilot, providing clear, step-by-step guidance tailored
                to your specific situation.
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Focused",
                  description: "We specialize exclusively in the XRPL ecosystem, ensuring deep expertise.",
                },
                {
                  icon: Users,
                  title: "User-First",
                  description: "Every feature is designed with beginners in mind. No jargon, just clarity.",
                },
                {
                  icon: Heart,
                  title: "Transparent",
                  description: "We earn through affiliate links only. No hidden fees, no dark patterns.",
                },
              ].map((value, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-md text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-400/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>

            <section className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-400/5 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">What We Are Not</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✗</span>
                  <span>We are not a wallet. We don't store your crypto.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✗</span>
                  <span>We are not an exchange. We don't process transactions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✗</span>
                  <span>We are not financial advisors. Our guidance is informational only.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
