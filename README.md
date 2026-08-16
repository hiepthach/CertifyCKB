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
2. **OffCKB** for local devnet (optional for development)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Copy example env file
cp .env.local.example .env.local
```

### 3. Start OffCKB Devnet (Optional)

```bash
# Terminal 1: Start OffCKB node
npx offckb node

# Or use the npm script
npm run offckb:start
```

OffCKB will start a local CKB devnet at `http://localhost:28114`.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

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
│   ├── verification/     # Verification components
│   └── batch/            # Batch issuance
├── lib/
│   ├── ckb/              # CKB config & client
│   └── credentials/      # Core credential logic
├── types/                # TypeScript types
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## Features

### Week 1: Setup & Cluster Management

- [x] Project scaffold
- [x] Wallet integration (JoyID, MetaMask, WalletConnect)
- [x] Cluster creation/viewing
- [x] OffCKB devnet setup

### Week 2: Certificate Issuance & View

- [ ] Certificate issuance
- [ ] Certificate viewing
- [ ] Certificate detail page
- [ ] Share functionality

### Week 3: Verification & Extended Features

- [ ] Certificate verification
- [ ] Template system
- [ ] Batch issuance
- [ ] Expiration/Revocation

### Week 4: Polish & Documentation

- [ ] UI polish
- [ ] Error handling
- [ ] Documentation
- [ ] Testing

## Wallet Support

| Wallet | Status | Notes |
|--------|--------|-------|
| JoyID | ✅ | Recommended for devnet |
| MetaMask | ✅ | Via @ckb-ccc/core |
| WalletConnect | ✅ | Requires project ID |

## Networks

Configure via `NEXT_PUBLIC_NETWORK` in `.env.local`:

| Network | Node URL | Explorer |
|---------|----------|----------|
| devnet | localhost:28114 | N/A |
| testnet | testnet.ckb.dev | explorer.nervos.org/aggron2 |
| mainnet | mainnet.ckb.com | explorer.nervos.org |

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck   # TypeScript check

npm run offckb:start  # Start OffCKB devnet
npm run offckb:stop   # Stop OffCKB
```

## Resources

- [CCC SDK Documentation](https://docs.ckbccc.com)
- [Spore Protocol](https://docs.spore.pro/)
- [OffCKB](https://github.com/nervosnetwork/offckb)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)

## License

MIT
