# XRPilot - Pilot Digital Wallet

A digital wallet built on the XRP Ledger, designed for humans, not crypto experts. Zero friction onboarding with free wallet activation.

## Features

- **Zero-friction onboarding** — Create wallet, set PIN, auto-activate (testnet faucet or mainnet sponsoring)
- **Send & Receive** — XRP payments in 3-5 seconds with PIN confirmation
- **Digital Objects** — Browse and manage NFTs/digital objects
- **DEX Swap** — Token exchange interface
- **Security** — AES-256-GCM encryption, PBKDF2 600k iterations, PIN-protected
- **XRPL Chatbot** — Built-in assistant for XRP ecosystem questions
- **Interactive Tutorial** — Step-by-step animated guide for newcomers

## Tech Stack

- **Next.js 16** + React 19
- **Tailwind CSS v4** + shadcn/ui
- **xrpl.js v4** — XRPL transactions
- **Zustand v5** — State management
- **Web Crypto API** — Client-side encryption

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_XRPL_NETWORK` | No | `testnet` (default) or `mainnet` |
| `NEXT_PUBLIC_XRPL_NODES` | No | Comma-separated mainnet node URLs |
| `XRPL_SPONSOR_SEED` | Mainnet only | Server-side wallet seed for activation |

## Development

```bash
pnpm install
pnpm dev
```

## Deployment

Deployed on Vercel. Push to trigger automatic deployments.
