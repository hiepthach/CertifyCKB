# DOB Credential & Badge Protocol — Implementation Architecture

## Table of Contents

1. [Overview](#1-overview)
2. [Feature Specification](#2-feature-specification)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Data Structures](#5-data-structures)
6. [Module Design](#6-module-design)
7. [User Flows](#7-user-flows)
8. [Custom On-Chain Scripts (Future)](#8-custom-on-chain-scripts-future)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment Configuration](#10-deployment-configuration)
11. [Milestones](#11-milestones)

---

## 1. Overview

This document describes the implementation architecture for the DOB Credential & Badge Protocol, a verifiable credentials system built on CKB using the Spore Protocol.

### 1.1 Design Principles

- **Self-Sovereign**: Users own their credentials as on-chain assets
- **Composable**: Built on existing standards (W3C VC, Spore, CCC SDK)
- **Minimal Viable**: Start with MVP, extend features iteratively
- **CKB-Native**: Leverage CKB's unique advantages (zero fees, on-chain storage)

---

## 2. Feature Specification

### 2.1 Feature Matrix

| Feature | Priority | Description |
|---------|----------|-------------|
| **F1: Wallet Connection** | P0 | Connect wallet via JoyID, MetaMask, Neuron, Portal |
| **F2: Cluster Creation** | P0 | Issuer creates credential Clusters |
| **F3: Credential Issuance** | P0 | Mint credential DOBs to recipients |
| **F4: Credential Display** | P0 | View credentials in holder dashboard |
| **F5: Credential Verification** | P0 | Query and verify credential validity |
| **F6: Credential Presentation** | P1 | Share credential details/copy ID |
| **F7: Non-Transferable** | P1 | Soulbound credentials cannot be transferred |
| **F8: Expiration** | P1 | Time-based credential validity |
| **F9: Revocation** | P2 | Issuer can mark credentials as revoked |
| **F10: Credential Types** | P0 | Support multiple credential types (course, event, cert) |

### 2.2 Feature Details

#### F1: Wallet Connection
- Support multiple wallets: JoyID (WebAuthn), MetaMask (Omnilock), Neuron, Portal Wallet
- Use `@ckb-ccc/connector-react` for React integration
- Display connected wallet status and address
- Handle disconnection and reconnection

#### F2: Cluster Creation
- Issuer creates a Cluster for each credential type/organization
- Cluster stores: name, description, credential policy
- Cluster owner controls credential issuance
- Cluster ID used as issuer identifier in credentials

#### F3: Credential Issuance
- Issue credentials as Spore DOBs
- Credential DNA stores W3C VC-compatible JSON
- Support multiple credential types:
  - Course Completion
  - Event Attendance
  - Professional Certification
- Associate credentials with issuer's Cluster

#### F4: Credential Display
- Holder sees all credentials in their wallet
- Display credential summary: type, title, issuer, date
- Show credential status: active, expired, revoked
- Link to full credential details

#### F5: Credential Verification
- Input: Credential ID (Spore DOB ID)
- Output: Verification result with details
- Verify: issuer, validity, expiration, revocation status
- Show verification timestamp

#### F6: Credential Presentation
- Copy credential ID to clipboard
- Open in CKB Explorer
- Display full credential JSON
- Generate shareable verification link (future)

#### F7: Non-Transferable (Soulbound)
- Credentials locked to recipient wallet
- Cannot be transferred after issuance
- Enforced by custom Type Script (future) or policy

#### F8: Expiration
- Optional expiration date in credential DNA
- UI shows "Expired" badge for expired credentials
- Verification returns expired status

#### F9: Revocation
- Issuer can mark credential as revoked
- Revocation stored in credential status field
- Verification returns revoked status

#### F10: Credential Types
| Type | Fields | Policy |
|------|--------|--------|
| **Course Completion** | course name/description, completion date, grade, skills | transferable or not |
| **Event Attendance** | event name/dates, location, role | non-transferable |
| **Professional Cert** | certification name, issuing body, validity period | non-transferable |

### 2.3 User Roles

| Role | Capabilities |
|------|-------------|
| **Issuer** | Create Clusters, Issue Credentials, Revoke Credentials |
| **Holder** | View Own Credentials, Present Credentials, Transfer (if allowed) |
| **Verifier** | Verify Credential Validity, Check Issuer, Check Expiration |

---

## 3. System Architecture

### 3.1 Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend Layer (React/Next.js)"]
        UI["UI Components"]
        PAGES["Pages"]
    end

    subgraph SDK["SDK Layer"]
        CCC["@ckb-ccc/connector-react"]
        SPORE["@spore-sdk/core"]
    end

    subgraph Blockchain["CKB Blockchain (L1)"]
        SPORE_CELLS["Spore Cells<br/>Clusters + Credentials"]
        SCRIPT["Spore Type Scripts"]
    end

    UI --> PAGES
    PAGES --> CCC
    CCC --> SPORE
    SPORE --> SCRIPT
    SPORE_CELLS --> SCRIPT
```

### 3.2 Component Interaction

```mermaid
graph LR
    subgraph Frontend
        ISSUER_UI["Issuer UI"]
        HOLDER_UI["Holder UI"]
        VERIFIER_UI["Verifier UI"]
    end

    subgraph Services
        ISSUER_SVC["Issuer Service"]
        VERIFIER_SVC["Verifier Service"]
    end

    subgraph Storage
        CKB["CKB Cells"]
    end

    ISSUER_UI --> ISSUER_SVC
    ISSUER_SVC --> CKB
    HOLDER_UI --> VERIFIER_SVC
    VERIFIER_SVC --> CKB
    VERIFIER_UI --> VERIFIER_SVC
```

### 3.3 Data Flow

```mermaid
flowchart LR
    subgraph Input
        CREDENTIAL_DATA["Credential Data"]
        ISSUER_WALLET["Issuer Wallet"]
        RECIPIENT_WALLET["Recipient Wallet"]
    end

    subgraph Process
        ENCODE["Encode to W3C VC JSON"]
        CREATE_TX["Create Transaction"]
        SIGN["Sign Transaction"]
    end

    subgraph Output
        SPORE_DOB["Spore DOB Cell"]
        TX_HASH["Transaction Hash"]
    end

    CREDENTIAL_DATA --> ENCODE
    ISSUER_WALLET --> SIGN
    RECIPIENT_WALLET --> CREATE_TX
    ENCODE --> CREATE_TX
    CREATE_TX --> SIGN
    SIGN --> SPORE_DOB
    SIGN --> TX_HASH
```

---

## 4. Project Structure

### 4.1 Directory Layout

```
dob-credential-protocol/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout with CCC Provider
│   │   ├── page.tsx                 # Landing page
│   │   ├── issuer/
│   │   │   └── page.tsx             # Issuer dashboard
│   │   ├── holder/
│   │   │   └── page.tsx             # Holder dashboard
│   │   └── verifier/
│   │       └── page.tsx             # Verification page
│   │
│   ├── components/                   # Reusable React components
│   │   ├── ui/                      # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── wallet/
│   │   │   └── WalletConnect.tsx
│   │   ├── credential/
│   │   │   ├── CredentialCard.tsx
│   │   │   ├── CredentialDetail.tsx
│   │   │   └── CredentialForm.tsx
│   │   ├── cluster/
│   │   │   ├── ClusterCard.tsx
│   │   │   └── ClusterForm.tsx
│   │   └── verification/
│   │       └── VerifyResult.tsx
│   │
│   ├── lib/                         # Business logic
│   │   ├── ckb/                     # CKB client configuration
│   │   │   ├── config.ts            # Network & script configs
│   │   │   └── client.ts            # Client setup
│   │   ├── credentials/              # Credential business logic
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   ├── encoder.ts           # W3C VC JSON encoding
│   │   │   ├── decoder.ts           # W3C VC JSON decoding
│   │   │   ├── issuer.ts            # Credential issuance logic
│   │   │   └── verifier.ts          # Credential verification logic
│   │   └── utils/
│   │       └── formatters.ts        # Utility functions
│   │
│   └── styles/
│       └── globals.css              # Global styles
│
├── contracts/                        # Rust on-chain scripts (future)
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs
│       └── credential.rs
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

### 4.2 Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `app/` | Page components and routing |
| `components/ui/` | Generic UI primitives |
| `components/wallet/` | Wallet connection UI |
| `components/credential/` | Credential display and forms |
| `components/cluster/` | Cluster management UI |
| `lib/ckb/` | CKB client and configuration |
| `lib/credentials/` | Credential business logic |
| `contracts/` | Custom on-chain scripts |

---

## 5. Data Structures

### 5.1 Credential DNA (W3C VC Compatible)

```mermaid
classDiagram
    class VerifiableCredential {
        +string[] @context
        +string id
        +string[] type
        +Issuer issuer
        +string issuanceDate
        +string? expirationDate
        +CredentialSubject credentialSubject
        +Evidence[]? evidence
        +CredentialStatus? credentialStatus
        +Metadata? metadata
    }

    class Issuer {
        +string id
        +string name
        +string? description
    }

    class CredentialSubject {
        +string id
        +any ...
    }

    class CourseCredential {
        +string id
        +Course course
        +string completionDate
        +string? grade
        +string[] skills
    }

    class EventCredential {
        +string id
        +Event event
        +string attendanceType
    }

    class CertificationCredential {
        +string id
        +Certification certification
        +string examDate
        +string? score
    }

    VerifiableCredential --> Issuer
    VerifiableCredential --> CredentialSubject
    CredentialSubject <|-- CourseCredential
    CredentialSubject <|-- EventCredential
    CredentialSubject <|-- CertificationCredential
```

### 5.2 TypeScript Interfaces

```typescript
// Credential Types
interface VerifiableCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: Issuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  evidence?: Evidence[];
  credentialStatus?: CredentialStatus;
  metadata?: CredentialMetadata;
}

interface Issuer {
  id: string;
  name: string;
  description?: string;
}

interface CredentialSubject {
  id: string;
  [key: string]: any;
}

// Credential-specific subjects
interface CourseCredential extends CredentialSubject {
  course: {
    name: string;
    description: string;
    duration: string;
    institution: string;
  };
  completionDate: string;
  grade?: string;
  skills: string[];
}

interface EventCredential extends CredentialSubject {
  event: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
  };
  attendanceType: 'in-person' | 'virtual' | 'hybrid';
}

interface CertificationCredential extends CredentialSubject {
  certification: {
    name: string;
    issuingBody: string;
    level: string;
    validityPeriod: string;
  };
  examDate: string;
  score?: number;
}

// Cluster Configuration
interface ClusterConfig {
  name: string;
  description: string;
  credentialPolicy: CredentialPolicy;
  metadata?: {
    issuerUrl?: string;
    revocationEndpoint?: string;
  };
}

interface CredentialPolicy {
  transferable: boolean;
  requiresIssuerSignature: boolean;
  maxIssuancePerRecipient?: number;
  allowRenewal: boolean;
  expirationRequired: boolean;
  revocationEnabled: boolean;
}

// Verification
interface VerificationResult {
  valid: boolean;
  credentialId: string;
  issuer: {
    id: string;
    name: string;
    clusterVerified: boolean;
  };
  holder: {
    address: string;
    ownershipVerified: boolean;
  };
  credential: {
    type: string[];
    issuanceDate: string;
    expirationDate?: string;
    isExpired: boolean;
    isRevoked: boolean;
  };
  timestamp: string;
}
```

---

## 6. Module Design

### 6.1 Module Overview

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        ISSUER_PAGE["Issuer Page"]
        HOLDER_PAGE["Holder Page"]
        VERIFIER_PAGE["Verifier Page"]
    end

    subgraph Components["UI Components"]
        WALLET["WalletConnect"]
        CRED_CARD["CredentialCard"]
        CRED_FORM["CredentialForm"]
        CLUSTER_FORM["ClusterForm"]
        VERIFY_RESULT["VerifyResult"]
    end

    subgraph Services["Service Layer"]
        ISSUER_SVC["Issuer Service"]
        VERIFIER_SVC["Verifier Service"]
    end

    subgraph SDK["SDK Layer"]
        CCC["CCC SDK"]
        SPORE_SDK["Spore SDK"]
    end

    subgraph Blockchain["Blockchain"]
        CKB["CKB Network"]
    end

    ISSUER_PAGE --> ISSUER_SVC
    HOLDER_PAGE --> VERIFIER_SVC
    VERIFIER_PAGE --> VERIFIER_SVC
    ISSUER_PAGE --> WALLET
    HOLDER_PAGE --> WALLET

    ISSUER_SVC --> CRED_FORM
    VERIFIER_SVC --> CRED_CARD
    VERIFIER_SVC --> VERIFY_RESULT

    ISSUER_SVC --> SPORE_SDK
    VERIFIER_SVC --> SPORE_SDK
    CRED_CARD --> SPORE_SDK

    SPORE_SDK --> CCC
    CCC --> CKB
```

### 6.2 Service Module Responsibilities

| Module | Operations | External Dependencies |
|--------|-----------|----------------------|
| **Issuer Service** | `createCluster`, `issueCourseCredential`, `issueEventBadge`, `issueCertification` | Spore SDK, CCC |
| **Verifier Service** | `verifyCredential`, `getHolderCredentials`, `getIssuerCredentials` | CCC, Spore SDK |
| **Encoder** | `encodeCredentialDNA`, `validateCredentialDNA` | None |
| **Decoder** | `decodeCredentialDNA`, `isExpired`, `isRevoked`, `formatDisplay` | None |

### 6.3 CCC & Spore SDK Usage

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant SVC as Issuer/Verifier Service
    participant SPORE as Spore SDK
    participant CCC as CCC SDK
    participant CKB as CKB Network

    Note over UI,CKB: Credential Issuance Flow
    UI->>SVC: Call issueCourseCredential()
    SVC->>SPORE: createCluster() / createSpore()
    SPORE->>CCC: Build transaction
    CCC->>CCC: completeInputsByCapacity()
    CCC->>CCC: completeFeeBy()
    SVC->>CKB: signAndSendTransaction()
    CKB-->>SVC: Return txHash

    Note over UI,CKB: Credential Verification Flow
    UI->>SVC: Call verifyCredential(id)
    SVC->>CCC: findCellsByType()
    CCC->>CKB: Query cell
    CKB-->>CCC: Return cell data
    CCC-->>SVC: Return cell
    SVC->>SVC: Decode DNA
    SVC-->>UI: Return VerificationResult
```

---

## 7. User Flows

### 7.1 Credential Issuance Flow

```mermaid
sequenceDiagram
    participant Issuer
    participant Frontend
    participant CCC as CCC SDK
    participant Spore as Spore SDK
    participant CKB as CKB Network

    Issuer->>Frontend: Connect wallet
    Frontend->>CCC: Connect wallet (JoyID/MetaMask)
    CCC-->>Frontend: Connected signer

    Issuer->>Frontend: Create Cluster (name, policy)
    Frontend->>Spore: createCluster()
    Spore->>Spore: Build cluster creation tx
    Spore->>CCC: tx.completeInputsByCapacity()
    Spore->>CCC: tx.completeFeeBy()
    Spore->>CKB: signAndSendTransaction()
    CKB-->>Spore: txHash
    Spore-->>Frontend: clusterId

    Issuer->>Frontend: Issue Credential (recipient, data)
    Frontend->>Frontend: Encode credential to W3C VC JSON
    Frontend->>Spore: createSpore()
    Spore->>Spore: Build credential DOB tx
    Spore->>CCC: tx.completeInputsByCapacity()
    Spore->>CCC: tx.completeFeeBy()
    Spore->>CKB: signAndSendTransaction()
    CKB-->>Spore: txHash
    Spore-->>Frontend: credentialId
    Frontend-->>Issuer: Success with credentialId
```

### 7.2 Credential Verification Flow

```mermaid
sequenceDiagram
    participant Verifier
    participant Frontend
    participant CCC as CCC SDK
    participant CKB as CKB Network

    Verifier->>Frontend: Enter credential ID
    Frontend->>CCC: findCellsByType(credentialId)
    CCC->>CKB: Query cell by type script args
    CKB-->>CCC: Return cell data
    CCC-->>Frontend: Return cell

    alt Cell found
        Frontend->>Frontend: Decode credential DNA (JSON)
        Frontend->>Frontend: Check expiration
        Frontend->>Frontend: Check revocation status
        Frontend->>Frontend: Verify issuer

        alt Valid
            Frontend-->>Verifier: ✅ Valid credential
        else Expired
            Frontend-->>Verifier: ⚠️ Expired
        else Revoked
            Frontend-->>Verifier: ❌ Revoked
        end
    else Cell not found
        Frontend-->>Verifier: ❌ Credential not found
    end
```

### 7.3 Holder Credential Management Flow

```mermaid
flowchart TD
    START["Holder Connects Wallet"] --> QUERY["Query credentials by holder address"]
    QUERY --> FIND["Find all Spore cells owned by holder"]
    FIND --> DECODE["Decode each cell's DNA"]
    DECODE --> FILTER["Filter W3C VC credentials"]
    FILTER --> DISPLAY["Display credential list"]
    DISPLAY --> SELECT["Select credential"]
    SELECT --> ACTION["Choose action"]
    ACTION --> VIEW["View Details"]
    ACTION --> COPY["Copy ID"]
    ACTION --> EXPLORER["Open in Explorer"]
    ACTION --> TRANSFER{"Transferable?"}
    TRANSFER -->|Yes| DO_TRANSFER["Transfer to another address"]
    TRANSFER -->|No| END["End"]
    DO_TRANSFER --> END
    VIEW --> END
    COPY --> END
    EXPLORER --> END
```

---

## 8. Custom On-Chain Scripts (Future)

### 8.1 Soulbound Credential Script

For non-transferable credentials, a custom Type Script may be needed.

```mermaid
graph LR
    subgraph Transaction
        INPUT["Input Cell<br/>(Old credential)"]
        OUTPUT["Output Cell<br/>(New owner)"]
    end

    subgraph Script["Soulbound Type Script"]
        CHECK["Check input == output owner?"]
        PASS["Pass"]
        FAIL["Reject"]
    end

    INPUT --> CHECK
    CHECK -->|Same owner| PASS
    CHECK -->|Different owner| FAIL
    PASS --> OUTPUT
```

### 8.2 Script Specifications

| Script | Type | Purpose |
|--------|------|---------|
| `credential-soulbound` | Type Script | Enforce non-transferability |
| `credential-revocable` | Type Script | Allow issuer revocation |
| `credential-expiring` | Type Script | Auto-expire after timestamp |

---

## 9. Testing Strategy

### 9.1 Test Layers

```mermaid
graph BT
    subgraph Tests
        E2E["E2E Tests"]
        INT["Integration Tests"]
        UNIT["Unit Tests"]
    end

    subgraph Coverage
        UI["UI Components"]
        SERVICES["Services"]
        CONTRACTS["On-Chain Scripts"]
    end

    UNIT --> SERVICES
    INT --> UI
    E2E --> E2E
    E2E --> CONTRACTS
```

### 9.2 Test Matrix

| Test | Target | Tools |
|------|--------|-------|
| Unit Tests | Encoder/Decoder logic | Jest / Vitest |
| Unit Tests | Service functions | Jest / Vitest |
| Integration Tests | Transaction building | CCC + Mock |
| Integration Tests | Type Script logic | ckb-testtool |
| E2E Tests | Full flows | Playwright |

---

## 10. Deployment Configuration

### 10.1 Environment Configuration

```mermaid
graph LR
    subgraph Environments
        DEV["Development"]
        TEST["Testnet"]
        PROD["Mainnet"]
    end

    subgraph Config
        URL["Network URLs"]
        SCRIPTS["Script Addresses"]
    end

    DEV --> URL
    DEV --> SCRIPTS
    TEST --> URL
    TEST --> SCRIPTS
    PROD --> URL
    PROD --> SCRIPTS
```

### 10.2 Network Configuration

| Environment | Network | CKB Node | Indexer |
|-------------|---------|----------|---------|
| Development | OffCKB Devnet | localhost:28114 | localhost:28114 |
| Testnet | CKB Testnet | testnet.ckb.dev | testnet.ckb.dev |
| Mainnet | CKB Mainnet | mainnet.ckb.com | mainnet.ckb.com |

---

## 11. Milestones

### 11.1 Timeline Overview

```mermaid
gantt
    title DOB Credential Protocol - Development Timeline
    dateFormat  YYYY-MM-DD
    section Week 9
    Project Setup & Cluster Management    :2024-01-01, 7d
    section Week 10
    Credential Issuance                   :2024-01-08, 7d
    section Week 11
    Credential Verification               :2024-01-15, 7d
    section Week 12
    Polish & Documentation              :2024-01-22, 7d
```

### 11.2 Detailed Milestones

| Week | Milestone | Deliverables | Success Criteria |
|------|-----------|--------------|------------------|
| **Week 9** | Project Setup & Cluster Management | Project scaffold, CCC + Spore integration, Cluster creation UI, Cluster listing | Issuer can create and view Clusters |
| **Week 10** | Credential Issuance | Credential forms (course, event, cert), W3C VC JSON encoding, Issuance transaction, Credential listing | Issuer can issue credentials, Holder can view them |
| **Week 11** | Credential Verification | Verification page, Credential detail view, Verification result display | Verifier can verify any credential |
| **Week 12** | Polish & Documentation | UI/UX improvements, Error handling, Testing, README | All features work, Tests pass |

### 11.3 Feature Release Plan

```mermaid
graph LR
    subgraph MVP[Week 9-10: MVP]
        W9["Week 9:<br/>Setup + Cluster"]
        W10["Week 10:<br/>Issuance"]
    end

    subgraph Extended[Week 11-12: Extended]
        W11["Week 11:<br/>Verification"]
        W12["Week 12:<br/>Polish"]
    end

    subgraph Future[Future Releases]
        SB["Soulbound Script"]
        REV["Revocation"]
        EXP["Expiration Script"]
    end

    W9 --> W10 --> W11 --> W12
    W12 --> SB
    W12 --> REV
    W12 --> EXP
```

---

## Appendix A: Key References

| Resource | URL |
|----------|-----|
| W3C VC Data Model | https://www.w3.org/TR/vc-data-model/ |
| Spore Protocol | https://docs.spore.pro/ |
| DOB/0 Protocol | https://docs.spore.pro/dob/dob0-protocol |
| CCC SDK | https://docs.ckbccc.com |
| Spore SDK | https://github.com/sporeprotocol/spore-sdk |

---

*Document Version: 1.0*
*Last Updated: 2026-08-11*
*Author: Claude (for CKBuilder Week 8)*
