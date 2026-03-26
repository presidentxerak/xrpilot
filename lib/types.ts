export interface Onramp {
  id: string
  name: string
  countries: string[]
  payment_methods: string[]
  supports: string[]
  estimated_fees: string
  estimated_time: string
  kyc_required: boolean
  affiliate_link: string
}

export interface Exchange {
  id: string
  name: string
  countries: string[]
  payment_methods: string[]
  supports: string[]
  estimated_fees: string
  estimated_time: string
  kyc_required: boolean
  affiliate_link: string
}

export interface Wallet {
  id: string
  name: string
  platforms: string[]
  features: string[]
  description: string
  download_link: string
}

export interface NFTMarketplace {
  id: string
  name: string
  features: string[]
  description: string
  affiliate_link: string
}

export interface TokenPlatform {
  id: string
  name: string
  features: string[]
  description: string
  affiliate_link: string
}

export interface Country {
  code: string
  name: string
}

export interface UserSelection {
  country: string
  paymentMethod: string
  goal: string
}

export interface Route {
  steps: RouteStep[]
  fees: string
  speed: string
  complexity: "Easy" | "Medium" | "Hard"
}

export interface RouteStep {
  type: "onramp" | "exchange" | "wallet" | "marketplace" | "platform"
  service: string
  serviceName: string
  description: string
  link: string
  timeEstimate: string
  riskWarning?: string
}
