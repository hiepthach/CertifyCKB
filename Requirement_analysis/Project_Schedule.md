# DOB Credential & Badge Protocol — 4-Week Project Schedule

## Overview

| Item | Details |
|------|---------|
| **Duration** | Week 9 – Week 12 (4 weeks) |
| **Goal** | Build a working MVP of a verifiable credentials system on CKB |

---

## Weekly Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 9** | Project Setup & Cluster Management | Project scaffold, wallet connection, cluster creation |
| **Week 10** | Credential Issuance | Credential issuance, W3C VC encoding, holder display |
| **Week 11** | Credential Verification | Verification, credential detail, verification results |
| **Week 12** | Polish & Documentation | Error handling, testing, README, demo |

---

## Week 9: Project Setup & Cluster Management

**Estimated Time**: 10 hours

### Goals
- Set up Next.js project with TypeScript
- Configure CCC SDK and Spore SDK for devnet
- Implement wallet connection
- Create Cluster management functionality

### Tasks

#### 1. Project Initialization (3h)

- [ ] Create Next.js project with TypeScript
  ```bash
  npx create-next-app@latest dob-credential-protocol --typescript --tailwind --eslint
  ```
- [ ] Install dependencies
  ```bash
  npm install @ckb-ccc/connector-react @ckb-ccc/core @ckb-ccc/spore
  npm install @spore-sdk/core
  ```

- [ ] Configure Tailwind CSS and global styles
- [ ] Set up project folder structure

#### 2. CKB Client & SDK Configuration (2h)

- [ ] Configure CKB client for OffCKB devnet
  - Network: `http://localhost:28114`
  - Reference: [CCC SDK Docs](https://docs.ckbccc.com)

- [ ] Configure Spore SDK
  - Use `predefinedSporeConfigs.Devnet` or custom config
  - Reference: [Spore SDK](https://docs.spore.pro/)

- [ ] Set up environment variables (`.env.local`)

#### 3. Wallet Connection (2h)

- [ ] Set up `CccProvider` in root layout
  ```tsx
  import { CccProvider } from "@ckb-ccc/connector-react";
  ```

- [ ] Implement `WalletConnect` component
  - Support: JoyID, MetaMask, Neuron, Portal Wallet
  - Display: connected wallet name, address

- [ ] Test wallet connection with multiple wallets

#### 4. Cluster Management (3h)

- [ ] Define TypeScript interfaces
  - `ClusterConfig`
  - `CredentialPolicy`

- [ ] Implement `createCluster` service function
  - Use Spore SDK's `createCluster()`
  - Reference: [Spore Cluster Creation](https://docs.spore.pro/)

- [ ] Create `ClusterForm` and `ClusterCard` components

- [ ] Build Issuer dashboard page

### Tech References
| Tech | Link | Purpose |
|------|------|---------|
| Next.js | https://nextjs.org/docs | React framework |
| TypeScript | https://www.typescriptlang.org/docs/ | Type safety |
| Tailwind CSS | https://tailwindcss.com/docs | Styling |
| CCC SDK | https://docs.ckbccc.com | CKB SDK |
| Spore SDK | https://docs.spore.pro/ | DOB protocol |
| JoyID | https://docs.joyid.dev/ | Wallet integration |
| Omnilock | https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0042-omnilock/0042-omnilock.md | Multi-chain wallet |

### Definition of Done
- [ ] Project runs on localhost
- [ ] Can connect wallet (JoyID or MetaMask)
- [ ] Can create a Cluster on devnet
- [ ] Can view list of created Clusters

---

## Week 10: Credential Issuance

**Estimated Time**: 10 hours

### Goals
- Implement W3C VC compliant credential encoding/decoding
- Build credential issuance for 3 types (course, event, certification)
- Create holder dashboard to view credentials

### Tasks

#### 1. Credential Data Layer (3h)

- [ ] Define TypeScript interfaces
  - `VerifiableCredential`
  - `CredentialSubject`
  - `CourseCredential`, `EventCredential`, `CertificationCredential`

- [ ] Implement `encodeCredentialDNA()`
  - Encode credential data to W3C VC JSON
  - Add `@context`, `id`, `issuanceDate`

- [ ] Implement `decodeCredentialDNA()`
  - Decode JSON bytes to credential object
  - Add validation

#### 2. Credential Issuance (4h)

- [ ] Implement `issueCourseCredential()`
  - Course completion credential
  - Fields: course name, institution, completion date, grade, skills

- [ ] Implement `issueEventBadge()`
  - Event attendance badge (POAP-style)
  - Fields: event name, dates, location, attendance type

- [ ] Implement `issueCertification()`
  - Professional certification
  - Fields: certification name, issuing body, level, validity period

- [ ] Create credential issuance forms with validation

#### 3. Holder Dashboard (3h)

- [ ] Implement `getHolderCredentials()`
  - Query Spore cells by holder address
  - Filter for W3C VC credentials

- [ ] Create `CredentialCard` component
  - Display: type, title, issuer, date, status

- [ ] Build holder dashboard page
  - List all credentials in wallet

### Tech References
| Tech | Link | Purpose |
|------|------|---------|
| W3C VC Data Model | https://www.w3.org/TR/vc-data-model/ | Credential standard |
| JSON-LD | https://json-ld.org/ | JSON for linked data |
| Spore createSpore | https://docs.spore.pro/ | DOB creation |
| Cell Query | https://docs.ckbccc.com/api/ccc | Query cells |

### Definition of Done
- [ ] Can issue course completion credential
- [ ] Can issue event attendance badge
- [ ] Can issue professional certification
- [ ] Holder can view all credentials in dashboard
- [ ] Full issuance flow works end-to-end

---

## Week 11: Credential Verification

**Estimated Time**: 10 hours

### Goals
- Build credential verification functionality
- Create verification UI and result display
- Implement credential detail view

### Tasks

#### 1. Verification Logic (3h)

- [ ] Implement `verifyCredential()`
  - Query credential cell by ID
  - Decode and validate credential DNA
  - Check expiration and revocation status

- [ ] Implement `isExpired()`
  - Check `expirationDate` field

- [ ] Implement `isRevoked()`
  - Check `credentialStatus` field

- [ ] Define `VerificationResult` type

#### 2. Verification UI (4h)

- [ ] Create `VerifyResult` component
  - Display: valid/invalid status
  - Show: issuer, type, dates, status badges

- [ ] Build verifier page
  - Input: credential ID
  - Output: verification result

- [ ] Create `CredentialDetail` component
  - Full credential view
  - Show all credential fields

#### 3. Polish & Integration (3h)

- [ ] Add CKB Explorer links
  - View transaction on explorer
  - Reference: [CKB Explorer](https://explorer.nervos.org/)

- [ ] Implement copy credential ID
  - Clipboard API

- [ ] End-to-end verification test

### Tech References
| Tech | Link | Purpose |
|------|------|---------|
| CKB Explorer | https://explorer.nervos.org/ | Transaction lookup |
| Cell findCellsByType | https://docs.ckbccc.com/api/ccc | Cell queries |
| Clipboard API | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API | Copy to clipboard |

### Definition of Done
- [ ] Can verify credential by ID
- [ ] Verification shows expiration status
- [ ] Can view full credential details
- [ ] Explorer links work
- [ ] Copy ID feature works

---

## Week 12: Polish & Documentation

**Estimated Time**: 10 hours

### Goals
- Improve error handling and UX
- Write tests for core functions
- Document the project
- Prepare demo

### Tasks

#### 1. Error Handling & UX (3h)

- [ ] Review all error cases
  - Network errors
  - Invalid inputs
  - Transaction failures

- [ ] Add loading states
  - Spinners during transactions
  - Disabled buttons during loading

- [ ] Add empty states
  - "No credentials yet" message
  - "No clusters created" message

#### 2. Testing (3h)

- [ ] Write unit tests for `encoder`
  ```typescript
  // Test encodeCredentialDNA
  // Test validateCredentialDNA
  ```

- [ ] Write unit tests for `decoder`
  ```typescript
  // Test isExpired
  // Test isRevoked
  // Test formatCredentialDisplay
  ```

- [ ] Integration test: full credential lifecycle
  - Create cluster → Issue credential → Verify → Display

#### 3. Documentation (2h)

- [ ] Write comprehensive README
  - Project description
  - Setup instructions
  - Usage guide
  - Architecture overview
  - Screenshots

- [ ] Document API (if applicable)

#### 4. Demo Preparation (2h)

- [ ] Prepare demo script
  - Step-by-step walkthrough
  - Test data ready

- [ ] Final polish
  - Responsive design check
  - Browser compatibility check

### Tech References
| Tech | Link | Purpose |
|------|------|---------|
| Vitest | https://vitest.dev/guide/ | Unit testing |
| Playwright | https://playwright.dev/ | E2E testing |

### Definition of Done
- [ ] All error cases handled gracefully
- [ ] Loading and empty states implemented
- [ ] Unit tests for encoder/decoder pass
- [ ] README is complete with setup instructions
- [ ] Demo script prepared
- [ ] Can run full demo end-to-end

---

## Master Task Checklist

### Week 9
- [ ] Create Next.js project with TypeScript
- [ ] Install CCC SDK and Spore SDK
- [ ] Configure devnet connection
- [ ] Implement wallet connection (JoyID, MetaMask)
- [ ] Define Cluster interfaces
- [ ] Implement createCluster service
- [ ] Build cluster creation UI
- [ ] Build issuer dashboard

### Week 10
- [ ] Define credential interfaces (W3C VC)
- [ ] Implement encodeCredentialDNA
- [ ] Implement decodeCredentialDNA
- [ ] Implement issueCourseCredential
- [ ] Implement issueEventBadge
- [ ] Implement issueCertification
- [ ] Build credential issuance forms
- [ ] Implement getHolderCredentials
- [ ] Build holder dashboard

### Week 11
- [ ] Implement verifyCredential
- [ ] Implement isExpired, isRevoked
- [ ] Build VerifyResult component
- [ ] Build verifier page
- [ ] Build CredentialDetail component
- [ ] Add explorer links
- [ ] Add copy ID feature

### Week 12
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add empty states
- [ ] Write encoder tests
- [ ] Write decoder tests
- [ ] Integration test
- [ ] Write README
- [ ] Prepare demo
- [ ] Final polish

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Spore SDK compatibility issues | Medium | High | Test early, check SDK docs |
| Wallet connection problems | Low | Medium | Support multiple wallets |
| Complex credential forms | Medium | Low | Start simple, add incrementally |
| Time constraints | Medium | Medium | Prioritize MVP, defer non-essential |

---

## Time Tracking

| Week | Planned | Actual | Notes |
|------|---------|--------|-------|
| Week 9 | 10h | ___ | |
| Week 10 | 10h | ___ | |
| Week 11 | 10h | ___ | |
| Week 12 | 10h | ___ | |
| **Total** | **40h** | ___ | |

---

## Related Documents

| Document | Path |
|----------|------|
| Project Analysis | `Requirement_analysis/Project_Analysis.md` |
| Implementation Architecture | `Requirement_analysis/Implementation_Architecture.md` |

---

*Document Version: 1.0*
*Last Updated: 2026-08-11*
