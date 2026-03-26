import Link from "next/link"
import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GradientButton } from "@/components/gradient-button"
import { VideoCarousel } from "@/components/video-carousel"
import { Plane, Compass, Shield, Zap, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pb-24 md:pb-12">
        {/* Hero Section */}
        <section className="relative">
          <VideoCarousel>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white">
                <Plane className="w-4 h-4" />
                Your XRPL Navigation Tool
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance max-w-4xl">
                Your copilot into the{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  XRPL ecosystem
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl text-pretty">
                Navigate from fiat money to XRPL usage with confidence. Step-by-step guidance based on your country,
                payment method, and goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/pilot">
                  <GradientButton size="lg" className="w-full sm:w-auto">
                    Start Flying
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GradientButton>
                </Link>
                <Link href="/guides">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-colors border border-white/20">
                    Read Guides
                  </button>
                </Link>
              </div>
            </div>
          </VideoCarousel>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why XRPilot?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We guide you through the complex world of crypto with simple, personalized routes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Compass,
                title: "Personalized Routes",
                description: "Get step-by-step guidance based on your location, payment method, and goals.",
              },
              {
                icon: Shield,
                title: "No Custody Risk",
                description: "We never touch your funds. Just navigation and affiliate links to trusted services.",
              },
              {
                icon: Zap,
                title: "Always Up-to-Date",
                description: "Our routes are optimized for the latest fees, speeds, and availability.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to start your XRPL journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Select Your Location",
                description: "We detect your country automatically or let you choose.",
              },
              {
                step: 2,
                title: "Choose Payment Method",
                description: "Card, bank transfer, Apple Pay, or other options.",
              },
              { step: 3, title: "Pick Your Goal", description: "Get XRP, trade tokens, or buy NFTs on XRPL." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-foreground flex items-center justify-center text-2xl font-bold text-background mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pilot">
              <GradientButton size="lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </GradientButton>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
