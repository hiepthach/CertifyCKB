# CKB Credential Registry

A verifiable credentials system built on Nervos CKB using the Spore Protocol. Issue, manage, and verify course completion certificates as on-chain credentials.

## Tech Stack

- **Blockchain**: Nervos CKB
- **Credential Standard**: W3C Verifiable Credentials
- **Storage**: Spore Protocol (DOB/Cluster cells)
- **SDK**: CCC SDK (@ckb-ccc/core, @ckb-ccc/connector-react)
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **State**: React Query

## Prerequisites

1. **Node.js** 18+ installed

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Select Network

Click the network selector in the top-right corner to switch between:
- **Testnet (Aggron)** - For development and testing
- **Mainnet** - For production use (real transactions)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── clusters/          # Cluster management page
│   ├── certificates/      # Certificate pages
│   │   ├── page.tsx      # My certificates list
│   │   └── issue/        # Issue certificate page
│   └── verify/           # Certificate verification
├── components/
│   ├── ui/               # Base UI components
│   ├── wallet/           # Wallet connection
│   ├── cluster/          # Cluster components
│   ├── certificate/      # Certificate components
│   ├── template/         # Template components
│   ├── batch/            # Batch issuance
│   └── verification/     # Verification components
├── lib/
│   ├── ckb/              # CKB config & client
│   └── credentials/       # Core credential logic
├── types/                # TypeScript types
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## Features

### Core Features
- [x] Cluster Management (Provider Registration)
- [x] Certificate Issuance (Single)
- [x] Certificate Viewing
- [x] Certificate Verification
- [x] Share Functionality (Copy ID, Native Share, Explorer Link)

### Extended Features (Week 11)
- [x] Certificate Templates
  - Visual template configuration (classic, modern, compact, badge, detailed layouts)
  - Customizable colors, typography, and branding
  - Pre-defined certificate fields
- [x] Batch Issuance
  - CSV/JSON file upload
  - Batch validation and preview
  - Progress tracking during issuance
- [x] Expiration Tracking
  - Expiration date on certificates
  - Visual "Expired" status badges
  - Verification checks expiration
- [x] Melt Certificate
  - Holder can permanently destroy certificates
  - Reclaims locked CKB capacity
  - Melted certificates are no longer verifiable on-chain

### Quality & Polish (Week 12)
- [ ] Error Handling
- [ ] Loading States (Spinner component)
- [ ] Empty States (EmptyState component)
- [ ] Unit Tests (188 tests passing)
- [ ] Integration Tests
- [ ] Demo/Screencast

## Wallet Support

| Wallet | Status | Notes |
|--------|--------|-------|
| JoyID | ✅ | Recommended |
| MetaMask | ✅ | Via @ckb-ccc/core |
| WalletConnect | ✅ | Requires project ID |

## Networks

Switch networks using the network selector in the app UI:

| Network | Node URL | Explorer |
|---------|----------|----------|
| testnet | testnet.ckb.dev | explorer.nervos.org/aggron2 |
| mainnet | mainnet.ckb.com | explorer.nervos.org |

## Available Scripts

```bash
npm run dev          # Start dev server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npm run test         # Run tests (Vitest)
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Testing

Run unit tests:

```bash
npm test
```

Test coverage includes:
- UI Components (Badge, Button, Card, Input)
- Credentials (Encoder, Decoder, Issuer, Verifier)
- Services (Template, Cluster)
- Batch Issuance
- Share Utility

## Resources

- [CCC SDK Documentation](https://docs.ckbccc.com)
- [Spore Protocol](https://docs.spore.pro/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

## License

MIT
