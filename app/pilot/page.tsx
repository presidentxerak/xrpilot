import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PilotWizard } from "@/components/pilot/pilot-wizard"

export default function PilotPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <PilotWizard />
        </div>
      </main>

      <Footer />
    </div>
  )
}
