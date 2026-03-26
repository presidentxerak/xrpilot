import data from "./data.json"
import type { Route, UserSelection } from "./types"

export function calculateRoutes(selection: UserSelection): Route[] {
  const { country, paymentMethod, goal } = selection
  const routes: Route[] = []

  const availableOnramps = data.onramps.filter(
    (o) => o.countries.includes(country) && o.payment_methods.includes(paymentMethod),
  )

  const availableExchanges = data.exchanges.filter(
    (e) => e.countries.includes(country) && e.payment_methods.includes(paymentMethod),
  )

  const wallet = data.wallets[0]

  if (goal === "xrp") {
    availableOnramps.forEach((onramp) => {
      routes.push({
        steps: [
          {
            type: "onramp",
            service: onramp.id,
            serviceName: onramp.name,
            description: `Buy XRP directly with your ${formatPaymentMethod(paymentMethod)}.`,
            link: onramp.affiliate_link,
            timeEstimate: onramp.estimated_time,
            riskWarning: onramp.kyc_required ? "KYC verification required" : undefined,
          },
          {
            type: "wallet",
            service: wallet.id,
            serviceName: wallet.name,
            description: "Store your XRP securely and interact with XRPL.",
            link: wallet.download_link,
            timeEstimate: "5 min setup",
          },
        ],
        fees: onramp.estimated_fees,
        speed: onramp.estimated_time,
        complexity: "Easy",
      })
    })

    availableExchanges.forEach((exchange) => {
      routes.push({
        steps: [
          {
            type: "exchange",
            service: exchange.id,
            serviceName: exchange.name,
            description: `Create account and buy XRP on ${exchange.name}.`,
            link: exchange.affiliate_link,
            timeEstimate: exchange.estimated_time,
            riskWarning: "Exchange verification may take 1-3 days",
          },
          {
            type: "wallet",
            service: wallet.id,
            serviceName: wallet.name,
            description: "Withdraw XRP to your personal wallet.",
            link: wallet.download_link,
            timeEstimate: "5 min setup",
          },
        ],
        fees: exchange.estimated_fees,
        speed: exchange.estimated_time,
        complexity: "Medium",
      })
    })
  }

  if (goal === "tokens") {
    const tokenPlatform = data.token_platforms[0]

    availableOnramps.forEach((onramp) => {
      routes.push({
        steps: [
          {
            type: "onramp",
            service: onramp.id,
            serviceName: onramp.name,
            description: `Buy XRP to trade for tokens.`,
            link: onramp.affiliate_link,
            timeEstimate: onramp.estimated_time,
          },
          {
            type: "wallet",
            service: wallet.id,
            serviceName: wallet.name,
            description: "Set up your XRPL wallet.",
            link: wallet.download_link,
            timeEstimate: "5 min setup",
          },
          {
            type: "platform",
            service: tokenPlatform.id,
            serviceName: tokenPlatform.name,
            description: "Trade XRP for XRPL tokens on the DEX.",
            link: tokenPlatform.affiliate_link,
            timeEstimate: "Instant trades",
          },
        ],
        fees: onramp.estimated_fees + " + DEX fees",
        speed: onramp.estimated_time,
        complexity: "Medium",
      })
    })
  }

  if (goal === "nfts") {
    const nftMarketplace = data.nft_marketplaces[0]

    availableOnramps.forEach((onramp) => {
      routes.push({
        steps: [
          {
            type: "onramp",
            service: onramp.id,
            serviceName: onramp.name,
            description: `Buy XRP to purchase NFTs.`,
            link: onramp.affiliate_link,
            timeEstimate: onramp.estimated_time,
          },
          {
            type: "wallet",
            service: wallet.id,
            serviceName: wallet.name,
            description: "Store your XRP and interact with XRPL dApps.",
            link: wallet.download_link,
            timeEstimate: "5 min setup",
          },
          {
            type: "marketplace",
            service: nftMarketplace.id,
            serviceName: nftMarketplace.name,
            description: "Browse and buy NFTs on the XRP Ledger.",
            link: nftMarketplace.affiliate_link,
            timeEstimate: "Instant purchases",
          },
        ],
        fees: onramp.estimated_fees,
        speed: onramp.estimated_time,
        complexity: "Easy",
      })
    })
  }

  return routes.slice(0, 4)
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    card: "card",
    bank: "bank transfer",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    cash: "cash",
  }
  return methods[method] || method
}

export function getCountryName(code: string): string {
  const country = data.countries.find((c) => c.code === code)
  return country?.name || code
}

export function getGoalLabel(goal: string): string {
  const goals: Record<string, string> = {
    xrp: "Get XRP",
    tokens: "XRPL Tokens",
    nfts: "XRPL NFTs",
  }
  return goals[goal] || goal
}

export function getPaymentLabel(method: string): string {
  const methods: Record<string, string> = {
    card: "Card Payment",
    bank: "Bank Transfer",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    cash: "Cash",
  }
  return methods[method] || method
}
