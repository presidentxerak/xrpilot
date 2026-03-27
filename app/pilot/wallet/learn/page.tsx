import {
  ShieldCheck,
  Link2,
  Tag,
  Wallet,
  ArrowLeftRight,
  HelpCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const topics = [
  {
    icon: ShieldCheck,
    title: "What is a reserve?",
    description:
      "Every wallet on the XRP Ledger must hold a small amount of XRP (currently 1 XRP) as a reserve. Think of it like a minimum balance requirement at a bank. This reserve keeps the network running smoothly and prevents spam.",
  },
  {
    icon: Link2,
    title: "What are trust lines?",
    description:
      "Trust lines let your wallet hold tokens other than XRP, like stablecoins or community tokens. When you add a trust line, you are telling the network you are willing to hold that token. Each trust line slightly increases your reserve requirement.",
  },
  {
    icon: Tag,
    title: "What is a destination tag?",
    description:
      "A destination tag is a number attached to a payment that helps the recipient identify it. Exchanges and services use destination tags to know which customer a payment belongs to. Personal wallets usually do not need one.",
  },
  {
    icon: Wallet,
    title: "How do wallets work?",
    description:
      "Your wallet is protected by a secret key that only you control. When you send a payment, your wallet signs the transaction with this key to prove it is really you. Your PIN adds an extra layer of protection on your device.",
  },
  {
    icon: ArrowLeftRight,
    title: "What is a swap?",
    description:
      "A swap lets you exchange one type of token for another directly from your wallet. Instead of selling XRP and then buying another token separately, a swap does both in a single step using the built-in exchange on the XRP Ledger.",
  },
  {
    icon: HelpCircle,
    title: "What are transaction fees?",
    description:
      "Every transaction on the XRP Ledger costs a tiny fee, usually a fraction of a cent. These fees prevent spam and are destroyed (not paid to anyone). You will almost never notice them because they are so small.",
  },
]

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Learn</h1>
        <p className="text-muted-foreground">
          Simple explanations for common questions about your wallet and the XRP
          Ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <Card
              key={topic.title}
              className="border-border/50 bg-card/50"
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{topic.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {topic.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
