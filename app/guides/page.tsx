import { DesktopNav, MobileNav } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BookOpen, Clock, GraduationCap, Rocket, ExternalLink } from "lucide-react"
import Link from "next/link"

const beginnerGuides = [
  {
    title: "What is XRP?",
    description: "Introduction to XRP, the native cryptocurrency, and its value proposition.",
    readTime: "5 min read",
    category: "Basics",
    url: "https://xrpl.org/docs/introduction/what-is-xrp",
  },
  {
    title: "What is the XRP Ledger?",
    description: "A complete introduction to the XRP Ledger blockchain.",
    readTime: "8 min read",
    category: "Basics",
    url: "https://xrpl.org/docs/introduction/what-is-the-xrp-ledger",
  },
  {
    title: "Understanding Crypto Wallets",
    description: "Learn about custodial vs non-custodial and hardware vs software wallets.",
    readTime: "6 min read",
    category: "Wallets",
    url: "https://xrpl.org/docs/introduction/crypto-wallets",
  },
  {
    title: "Getting Started with Xaman Wallet",
    description: "Step-by-step guide to installing and setting up Xaman (formerly Xumm).",
    readTime: "10 min read",
    category: "Wallets",
    url: "https://help.xaman.app/app/getting-started-with-xaman/installing-xumm",
  },
  {
    title: "How to Create an XRP Ledger Account",
    description: "Create your first XRPL account with Xaman wallet.",
    readTime: "7 min read",
    category: "Wallets",
    url: "https://help.xaman.app/app/getting-started-with-xaman/your-first-xrp-ledger-account/how-to-create-an-xrpl-account",
  },
  {
    title: "Transactions and Requests",
    description: "Understand how transactions work on the XRP Ledger.",
    readTime: "6 min read",
    category: "Basics",
    url: "https://xrpl.org/docs/introduction/transactions-and-requests",
  },
  {
    title: "Cryptographic Keys & Security",
    description: "Essential security concepts for protecting your XRP and tokens.",
    readTime: "8 min read",
    category: "Security",
    url: "https://xrpl.org/docs/concepts/accounts/cryptographic-keys",
  },
  {
    title: "Introduction to XRPL NFTs",
    description: "Learn what NFTs are and how they work on the XRP Ledger.",
    readTime: "7 min read",
    category: "NFTs",
    url: "https://xrpl.org/docs/concepts/tokens/nfts",
  },
]

const experiencedGuides = [
  {
    title: "Decentralized Exchange (DEX)",
    description: "Master the native decentralized exchange on the XRP Ledger.",
    readTime: "10 min read",
    category: "Trading",
    url: "https://xrpl.org/docs/concepts/tokens/decentralized-exchange",
  },
  {
    title: "Understanding Fungible Tokens",
    description: "Deep dive into trust lines and fungible tokens on XRPL.",
    readTime: "8 min read",
    category: "Technical",
    url: "https://xrpl.org/docs/concepts/tokens/fungible-tokens",
  },
  {
    title: "Automated Market Makers (AMMs)",
    description: "How AMMs work on the XRP Ledger for liquidity provision.",
    readTime: "12 min read",
    category: "DeFi",
    url: "https://xrpl.org/docs/concepts/tokens/decentralized-exchange/automated-market-makers",
  },
  {
    title: "Create an AMM Tutorial",
    description: "Step-by-step guide to creating your own AMM on XRPL.",
    readTime: "15 min read",
    category: "DeFi",
    url: "https://xrpl.org/docs/tutorials/how-tos/use-tokens/create-an-automated-market-maker",
  },
  {
    title: "JavaScript Development on XRPL",
    description: "Build applications with JavaScript and the xrpl.js library.",
    readTime: "20 min read",
    category: "Development",
    url: "https://xrpl.org/docs/tutorials/javascript",
  },
  {
    title: "Issue a Fungible Token",
    description: "How to create and issue your own tokens on the XRP Ledger.",
    readTime: "12 min read",
    category: "Development",
    url: "https://xrpl.org/docs/tutorials/how-tos/use-tokens/issue-a-fungible-token",
  },
  {
    title: "Running XRPL Infrastructure",
    description: "Install and configure rippled server or Clio API server.",
    readTime: "15 min read",
    category: "Infrastructure",
    url: "https://xrpl.org/docs/infrastructure/installation",
  },
  {
    title: "Mint and Burn NFTs",
    description: "Advanced NFT operations with JavaScript on the XRP Ledger.",
    readTime: "10 min read",
    category: "NFTs",
    url: "https://xrpl.org/docs/tutorials/javascript/nfts/mint-and-burn-nfts",
  },
]

const xrplCommonsGuides = [
  {
    title: "About XRPL Commons",
    description: "Discover the XRPL Commons Foundation and its mission to nurture the XRPL ecosystem.",
    readTime: "3 min read",
    category: "Foundation",
    url: "https://www.xrpl-commons.org/",
  },
  {
    title: "Developer Training",
    description: "Join XRPL Commons training sessions to learn building on XRPL.",
    readTime: "5 min read",
    category: "Training",
    url: "https://www.xrpl-commons.org/build/training",
  },
  {
    title: "XRPL Hackathons",
    description: "Participate in hackathons organized by XRPL Commons.",
    readTime: "4 min read",
    category: "Events",
    url: "https://www.xrpl-commons.org/build/hackathons",
  },
  {
    title: "Aquarium Residency Program",
    description: "Apply for the in-house residency in Paris for XRPL builders.",
    readTime: "6 min read",
    category: "Programs",
    url: "https://www.xrpl-commons.org/residency",
  },
  {
    title: "University Partnerships",
    description: "Learn about academic collaborations and PhD programs.",
    readTime: "5 min read",
    category: "Education",
    url: "https://www.xrpl-commons.org/learn/university-partnerships",
  },
  {
    title: "XRPL Commons Blog",
    description: "Latest news and updates from the XRPL Commons Foundation.",
    readTime: "5 min read",
    category: "News",
    url: "https://www.xrpl-commons.org/about/blog",
  },
  {
    title: "Community Events",
    description: "Upcoming events, meetups, and conferences from XRPL Commons.",
    readTime: "4 min read",
    category: "Community",
    url: "https://www.xrpl-commons.org/engage/events",
  },
  {
    title: "XRPL Ecosystem Map",
    description: "Explore the complete map of projects building on XRPL.",
    readTime: "3 min read",
    category: "Ecosystem",
    url: "https://map.xrpl-commons.org/",
  },
]

interface GuideCardProps {
  title: string
  description: string
  readTime: string
  category: string
  url: string
}

function GuideCard({ title, description, readTime, category, url }: GuideCardProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group cursor-pointer block"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full bg-foreground/5 text-xs font-medium text-foreground">{category}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {readTime}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="flex items-center gap-1 text-sm font-medium text-primary">
        Read guide
        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav />
      <MobileNav />

      <main className="flex-1 pt-20 md:pt-24 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Guides & Tutorials</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn everything you need to know about navigating the XRPL ecosystem, from basics to advanced topics.
            </p>
          </div>

          {/* Beginner Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-background" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">For Beginners</h2>
                <p className="text-muted-foreground text-sm">Start your XRPL journey here</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {beginnerGuides.map((guide, index) => (
                <GuideCard key={index} {...guide} />
              ))}
            </div>
          </section>

          {/* Experienced Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                <Rocket className="w-6 h-6 text-background" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">For Experienced Users</h2>
                <p className="text-muted-foreground text-sm">Advanced topics and deep dives</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiencedGuides.map((guide, index) => (
                <GuideCard key={index} {...guide} />
              ))}
            </div>
          </section>

          {/* XRPL Commons Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-background"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">XRPL Commons Foundation</h2>
                <p className="text-muted-foreground text-sm">Community resources and opportunities</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {xrplCommonsGuides.map((guide, index) => (
                <GuideCard key={index} {...guide} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
