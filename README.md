# Pilot - Digital Object Wallet for XRPL

Pilot is a digital object wallet built on the XRP Ledger. It provides a web application and browser extension for managing XRP, tokens, NFTs, and other digital objects on the XRPL with a focus on security, usability, and performance.

## Tech Stack

- **Runtime:** Node.js 20
- **Package Manager:** pnpm 9
- **Monorepo:** Turborepo
- **Language:** TypeScript 5
- **Web App:** Next.js 14, React 18, Tailwind CSS, Zustand, TanStack Query
- **Extension:** Vite, React 18, Chrome Extension Manifest V3
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **Blockchain:** xrpl.js 3
- **Validation:** Zod
- **CI/CD:** GitHub Actions, Vercel

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) >= 9.1.0

### Install

```bash
git clone https://github.com/your-org/xrpilot.git
cd xrpilot
pnpm install
```

### Configure Environment

Copy the example environment files and fill in any required values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/extension/.env.example apps/extension/.env.local
```

### Development

```bash
# Start all apps and packages in development mode
pnpm dev

# Start only the web app
pnpm turbo dev --filter=@pilot/web

# Start only the extension
pnpm turbo dev --filter=@pilot/extension
```

### Build

```bash
# Build everything
pnpm build

# Build a specific app or package
pnpm turbo build --filter=@pilot/web
pnpm turbo build --filter=@pilot/extension
```

## Monorepo Structure

```
xrpilot/
├── apps/
│   ├── web/              # Next.js web application
│   └── extension/        # Chrome/browser extension (Vite)
├── packages/
│   ├── analytics/        # Analytics tracking and event collection
│   ├── design-tokens/    # Design system tokens (colors, spacing, typography)
│   ├── objects-engine/   # Digital object parsing, rendering, and management
│   ├── security/         # Encryption, key derivation, and secure storage
│   ├── shared/           # Shared types, constants, and utility functions
│   ├── ui/               # Reusable React component library
│   ├── wallet-core/      # Wallet creation, signing, and account management
│   └── xrpl-client/      # XRPL network client with connection management
├── turbo.json            # Turborepo pipeline configuration
├── pnpm-workspace.yaml   # pnpm workspace definition
└── package.json          # Root scripts and dev dependencies
```

### Apps

| App | Description |
|-----|-------------|
| `@pilot/web` | Next.js web application providing the full wallet experience with portfolio views, transaction management, and digital object browsing. |
| `@pilot/extension` | Browser extension built with Vite for quick access to wallet features and dApp interactions directly from the browser toolbar. |

### Packages

| Package | Description |
|---------|-------------|
| `@pilot/analytics` | Privacy-respecting analytics for tracking user interactions and app performance. |
| `@pilot/design-tokens` | Design tokens defining the visual language (colors, spacing, typography, radii) used across all apps. |
| `@pilot/objects-engine` | Core engine for parsing, classifying, and rendering digital objects (NFTs, tokens, URIs) from the XRPL. |
| `@pilot/security` | Cryptographic primitives including key derivation, AES encryption, secure memory handling, and biometric integration. |
| `@pilot/shared` | Shared TypeScript types, Zod schemas, constants, and utility functions used across the monorepo. |
| `@pilot/ui` | React component library built with Tailwind CSS, providing buttons, inputs, cards, modals, and wallet-specific components. |
| `@pilot/wallet-core` | Core wallet logic including mnemonic generation, key management, transaction building, and signing via xrpl.js. |
| `@pilot/xrpl-client` | XRPL WebSocket client with automatic reconnection, failover between nodes, request queuing, and subscription management. |

## Development Workflow

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm typecheck
```

### Formatting

```bash
pnpm format
```

## Testing

### Unit Tests

Run unit tests across all packages with Vitest:

```bash
pnpm test
```

### E2E Tests

Run end-to-end tests for the web app with Playwright. The web app must be built first:

```bash
pnpm build
pnpm test:e2e
```

To run E2E tests interactively:

```bash
cd apps/web
pnpm exec playwright test --ui
```

## Deployment

### Web App (Vercel)

The web app deploys automatically to Vercel on every push to `main` via the `deploy-web.yml` GitHub Actions workflow.

**Required GitHub Secrets:**

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Browser Extension

The extension is built automatically on every push to `main`. To create a release:

1. Tag the commit: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. The `build-extension.yml` workflow creates a GitHub Release with the extension zip attached.

The zip can then be submitted to the Chrome Web Store and other browser extension marketplaces.

## Security Practices

- **No private keys on servers.** All key material is generated and stored client-side only.
- **Encrypted storage.** Wallet secrets are encrypted at rest using AES-256-GCM with keys derived via PBKDF2/Argon2.
- **Mnemonic handling.** Recovery phrases are displayed once during onboarding and never stored in plaintext.
- **Input validation.** All user inputs and network responses are validated with Zod schemas before processing.
- **Dependency auditing.** Run `pnpm audit` regularly. CI checks for known vulnerabilities.
- **Content Security Policy.** The extension enforces a strict CSP to prevent injection attacks.
- **No analytics on sensitive data.** The analytics package never collects addresses, balances, or transaction details.

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Install dependencies: `pnpm install`
3. Make your changes and ensure all checks pass:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Write tests for new functionality.
5. Open a pull request against `main`. CI will run lint, typecheck, unit tests, build, and E2E tests.
6. Await code review. All PRs require at least one approval before merging.

## License

This project is proprietary. See LICENSE for details.
