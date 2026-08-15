# DOB Credential & Badge Protocol — Requirement Analysis

## 1. Project Overview

### 1.1 Project Name
**DOB Credential & Badge Protocol**

### 1.2 Project Type
Blockchain-native verifiable credentials system built on CKB using the Spore Protocol.

### 1.3 Project Summary

A protocol for issuing, managing, and verifying verifiable credentials (course completions, event attendance, skill certifications, employment history) as Spore DOBs organized in Clusters. Credentials are fully on-chain, holder-owned, backed by locked CKB, and transferable with zero fees.

### 1.4 Core Value Propositions

| Feature | Description |
|---------|-------------|
| **Fully On-Chain** | All credential data stored in Spore cells (DNA = credential metadata) |
| **Holder-Owned** | Credentials are NFTs owned by the recipient (wallet) |
| **CKB-Backed** | Issuing requires locking CKB; reclaimable by melting the credential |
| **Zero Transfer Fees** | CKB's model allows free credential transfers |
| **Cluster Organization** | Issuers create Clusters; recipients hold DOBs within Clusters |
| **Non-Transferable Option** | Credentials can be configured as soulbound (non-transferable) for certain use cases |

---

## 2. Problem Statement & Market Analysis

### 2.1 The Credential Verification Problem

Traditional credential systems suffer from:
- **Centralized control**: Institutions own and control records
- **Verification friction**: Third parties must contact issuers to verify
- **Data silos**: No interoperability between credential systems
- **Forgery risk**: Digital certificates can be copied or faked
- **Privacy issues**: Credentials reveal more information than necessary

### 2.2 CKB Community Relevance

**Why CKB is ideal for this use case:**

1. **UTXO Model Advantage**: Unlike account-based chains, credentials stored as cells don't require gas for transfers. This makes credential sharing truly free.

2. **Spore Protocol**: Native DOB standard with built-in:
   - Cluster organization (perfect for issuers/organizations)
   - DNA structure (flexible metadata for credential attributes)
   - Melt-to-reclaim (credentials have intrinsic value)

3. **CKB-VM Flexibility**: Custom validation scripts can enforce credential rules:
   - Expiration dates
   - Revocation mechanisms
   - Transferability constraints
   - Multi-sig issuance requirements

4. **Ecosystem Alignment**: The CKB community values:
   - Self-sovereign identity
   - Privacy-preserving systems
   - True on-chain ownership

### 2.3 Target Use Cases

| Use Case | Description | Credential Type |
|----------|-------------|----------------|
| **Online Course Certificates** | Completion proofs from educational platforms | Transferable/non-transferable |
| **Event Attendance Badges** | POAP-style attendance proofs for conferences/hackathons | Non-transferable |
| **Professional Certifications** | Skill attestations from recognized institutions | Non-transferable |
| **Employment History** | On-chain work experience verification | Non-transferable |
| **Achievement Badges** | Gamified skill acknowledgments | Transferable/non-transferable |
| **Membership Cards** | DAO/organization membership credentials | Semi-transferable |

---

## 3. Input/Output Analysis

### 3.1 System Inputs

#### 3.1.1 Issuer Inputs
```
- Issuer Wallet (Lock Script)
- Cluster Configuration
  - Cluster name
  - Cluster description (JSON with decoder config)
  - Cluster policy (who can mint credentials)
- Credential Template
  - Credential type
  - Required attributes
  - Transferability setting
  - Expiration policy
- Credential Metadata (per issuance)
  - Recipient address
  - Credential name/title
  - Issue date
  - Expiration date (optional)
  - Custom attributes (skills, scores, etc.)
  - Evidence/proof URLs
```

#### 3.1.2 Holder Inputs
```
- Holder Wallet (Lock Script)
- Credential ID to present
- Verification request (to third party)
```

#### 3.1.3 Verifier Inputs
```
- Credential Spore ID
- Expected issuer/cluster
- Expected credential type
- Verification timestamp
```

### 3.2 System Outputs

#### 3.2.1 On-Chain Outputs (Cells)
```
1. Cluster Cell (created by issuer)
   - Type Script: SPORE_CLUSTER
   - Data: Cluster configuration + metadata
   
2. Credential DOB Cell (created by issuer → recipient)
   - Type Script: SPORE
   - Data: Credential DNA (JSON metadata)
   - Lock Script: Recipient's wallet
   - Capacity: Locked CKB backing value
```

#### 3.2.2 Off-Chain Outputs
```
1. Transaction Receipt
   - Transaction hash
   - Credential Spore ID
   - Block confirmation

2. Verification Response
   - Credential validity
   - Issuer verification
   - Expiration status
   - Revocation status
```

---

## 4. Existing Credential Standards Reference

### 4.1 W3C Verifiable Credentials (VC) Data Model

The W3C VC standard provides the conceptual foundation:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "id": "urn:uuid:...",
  "type": ["VerifiableCredential", "CourseCertificate"],
  "issuer": {
    "id": "did:example:issuer123"
  },
  "issuanceDate": "2024-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:recipient456",
    "course": "CKB Development",
    "grade": "A"
  },
  "proof": { ... }
}
```

**W3C VC Concepts to Map:**
| VC Concept | CKB Implementation |
|-----------|-------------------|
| Credential | Spore DOB (DNA = credential data) |
| Issuer | Cluster owner |
| Holder | DOB owner (Lock Script) |
| Credential Type | DOB Cluster membership |
| Presentation | Read-only credential display |
| Verification | On-chain query + signature verification |

### 4.2 Ethereum Ecosystem Standards

#### 4.2.1 ERC-721 (NFT Standard)
- Basic token standard for unique assets
- Credentials as NFTs (current approach by some projects)
- **Limitation**: Gas fees for every transfer

#### 4.2.2 ERC-5192 (Soulbound Tokens)
Minimal Soulbound Token interface:

```solidity
interface IERC5192 {
    /// @notice Emitted when the locking status changes
    event Locked(address indexed owner);
    event Unlocked(address indexed owner);
    
    /// @notice Returns the locking status
    function locked(address account) external view returns (bool);
}
```

**CKB Implementation**:
- Use a custom Type Script that rejects transfers
- Lock the DOB to the recipient's address permanently
- Alternatively: use Spore's Cluster Agent to enforce non-transferability

#### 4.2.3 ENS (Ethereum Name Service)
- Domain names as NFTs
- Related for credential namespaces
- Cluster names could follow similar naming conventions

#### 4.2.4 Gitcoin Passport
- Identity verification system
- Stamps as credential attestations
- Quadratic funding integration
- **Lesson**: Integrate with existing identity systems

### 4.3 Bitcoin Ecosystem

#### 4.3.1 Ordinals Protocol
- Inscriptions as on-chain data
- Similar to Spore's on-chain content storage
- **Lesson**: Proven on-chain content works for digital artifacts

#### 4.3.2 Nostr
- Decentralized identity and credentials
- Relay-based verification
- **Lesson**: Credential verification doesn't need full blockchain

### 4.4 Other Blockchain Credentials

| Project | Approach | CKB Lesson |
|---------|---------|-----------|
| **POAP** | Attendance badges on Ethereum/Polygon | Non-transferable event credentials |
| **Gitcoin Passport** | Identity stamps with weighted scores | Verification scoring system |
| **Worldcoin** | Biometric identity | Privacy considerations |
| **BrightID** | Social graph identity | Sybil resistance |

### 4.5 Key Takeaways for CKB Implementation

1. **W3C VC as the data model**: Use W3C VC JSON structure for credential DNA
2. **ERC-5192 soulbound pattern**: Custom Type Script for non-transferable DOBs
3. **Spore Cluster as Issuer**: Cluster = Credential Type/Organization
4. **Zero fees**: CKB's model enables free credential transfers (unlike Ethereum)
5. **On-chain verification**: Query Spore cells directly, no off-chain database needed

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Blockchain** | Nervos CKB | L1 storage and validation |
| **Asset Protocol** | Spore Protocol | DOB creation and management |
| **DApp SDK** | CCC SDK (`@ckb-ccc/connector-react`) | Frontend wallet integration |
| **Backend (optional)** | Node.js + `@ckb-ccc/shell` | Indexer, API server |
| **On-Chain Scripts** | Rust + `ckb-std` | Custom credential validation |
| **Testing** | `ckb-testtool` + `ckb-debugger` | Contract testing |
| **Dev Environment** | OffCKB | Local devnet |
| **Data Format** | JSON (UTF-8) | Credential DNA content |

### 5.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Issue Cred   │  │ View Wallet  │  │ Verify Credential    │  │
│  │ Component    │  │ Credentials  │  │ Component            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CCC SDK Layer                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  @ckb-ccc/connector-react  │  @ckb-ccc/shell                │ │
│  │  - Wallet connection      │  - Transaction building       │ │
│  │  - Signer management      │  - Cell querying              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SPORE PROTOCOL LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Cluster     │  │  Spore DOB   │  │  Credential Type     │  │
│  │  Manager     │  │  (Credential) │  │  Script (optional)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CKB BLOCKCHAIN (L1)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cluster Cell          │  Credential DOB Cell              │ │
│  │  - Type: SPORE_CLUSTER │  - Type: SPORE                   │ │
│  │  - Data: JSON config   │  - Data: Credential DNA (JSON)   │ │
│  │  - Lock: Issuer        │  - Lock: Holder                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Credential DNA Structure (W3C VC Mapping)

Following the DOB/0 protocol pattern, credential DNA stores W3C VC-compliant JSON:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://credentials.example/v1"
  ],
  "id": "did:ckb:credential:0x...",
  "type": [
    "VerifiableCredential",
    "CourseCompletion"
  ],
  "issuer": {
    "id": "did:ckb:issuer:cluster:0x...",
    "name": "CKB Academy",
    "description": "Official CKB developer certification body"
  },
  "issuanceDate": "2024-01-15T00:00:00Z",
  "expirationDate": "2027-01-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:ckb:recipient:0x...",
    "recipientName": "John Doe",
    "course": {
      "name": "CKB Developer Fundamentals",
      "description": "Introduction to CKB development",
      "duration": "12 weeks"
    },
    "completionDate": "2024-01-10",
    "grade": "A",
    "skills": ["Rust", "CKB-VM", "Cell Model"]
  },
  "evidence": [
    {
      "id": "https://credentials.example/evidence/1",
      "type": "DocumentVerification",
      "verifier": "did:ckb:verifier:0x..."
    }
  ],
  "credentialStatus": {
    "id": "https://credentials.example/status/1",
    "type": "CredentialStatusList2023"
  }
}
```

### 5.4 Cluster Configuration

Cluster `description` field contains JSON configuration:

```json
{
  "name": "CKB Academy Credentials",
  "description": "Official credential issuance for CKB Academy courses",
  "credentialPolicy": {
    "transferable": false,
    "requiresIssuerSignature": true,
    "maxIssuancePerRecipient": 1,
    "allowRenewal": false
  },
  "decoder": {
    "type": "code_hash",
    "hash": "0x13cac78ad8482202f18f9df4ea707611c35f994375fa03ae79121312dda9925c"
  },
  "metadata": {
    "issuerUrl": "https://ckb.academy",
    "revocationEndpoint": "https://api.ckb.academy/revoke"
  }
}
```

---

## 6. Use Cases Deep Dive

### 6.1 Use Case 1: Online Course Certificate

**Scenario**: A user completes a CKB development course and receives a certificate.

**Flow**:
1. Issuer (Academy) creates a Cluster for their credentials
2. Upon course completion, Academy issues a DOB credential to the recipient
3. Credential DNA contains course details, completion date, grade
4. Recipient can present the credential to employers
5. Verifier queries the CKB chain to confirm validity

**Technical Details**:
- Credential Type: Non-transferable (soulbound)
- Expiration: Optional (e.g., 3 years)
- Cluster Policy: Only Academy can issue

### 6.2 Use Case 2: Event Attendance Badge (POAP-style)

**Scenario**: A user attends a CKB hackathon and receives a participation badge.

**Flow**:
1. Event organizer creates a Cluster for the event
2. After attendance verification, organizer mints DOBs to attendees
3. Badges are non-transferable (soulbound)
4. Attendees can showcase badges on profiles/social media

**Technical Details**:
- Credential Type: Non-transferable
- No expiration (permanent memento)
- Cluster Policy: Organizer controls issuance

### 6.3 Use Case 3: Professional Skill Certification

**Scenario**: A developer earns a "CKB Smart Contract Developer" certification.

**Flow**:
1. Certifying body creates a Cluster with strict policies
2. User passes an exam or meets criteria
3. Certifying body issues a credential DOB
4. Credential includes skills, certification level, validity period
5. Employers can verify instantly via CKB explorer or API

**Technical Details**:
- Credential Type: Non-transferable
- Expiration: Required (e.g., 2 years, renewable)
- Multi-sig: Requires multiple issuer signatures

### 6.4 Use Case 4: Employment History Verification

**Scenario**: A user wants to prove employment history on-chain.

**Flow**:
1. Employer creates/uses a Cluster
2. Upon employee onboarding, employer issues a DOB
3. DOB DNA contains: role, department, start date, status
4. Upon departure, credential can be "revoked" or marked inactive
5. User retains the DOB but it's marked as "former employee"

**Technical Details**:
- Credential Type: Semi-transferable (can be held after leaving)
- Revocation mechanism via status field
- Cluster Policy: HR department controls

---

## 7. Feasibility Analysis

### 7.1 Technical Feasibility: HIGH

**Strengths**:
- Spore SDK already provides Cluster and DOB creation
- CCC SDK handles wallet integration and transaction building
- DOB/0 protocol supports JSON content in DNA
- W3C VC JSON structure fits naturally in DOB data
- Zero-fee transfers align perfectly with credential sharing

**Challenges**:
- Non-transferable credentials require custom Type Script
- Revocation mechanism needs on-chain logic
- Credential verification requires indexer or full node access

### 7.2 Community Relevance: HIGH

**CKB Community Benefits**:
- Self-sovereign identity aligns with CKB philosophy
- Addresses real need (credential verification is pain point)
- Leverages existing Spore ecosystem
- Showcases CKB's unique advantages (zero fees, on-chain content)

**Adoption Potential**:
- Can integrate with existing CKB educational programs
- Hackathon organizers can issue badges
- Developer communities can use for skill verification
- Potential integration with RGB++ for Bitcoin-native credentials

### 7.3 Development Effort: MEDIUM

| Component | Effort | Notes |
|-----------|--------|-------|
| Cluster Management UI | Low | Standard Spore SDK usage |
| Credential Issuance Flow | Low | Based on existing Spore patterns |
| Non-Transferable Script | Medium | Custom Type Script in Rust |
| Credential Verification | Low | On-chain cell query |
| Revocation System | Medium | Requires state management |
| Frontend Wallet Integration | Low | CCC connector-react |
| Testing | Medium | ckb-testtool for Type Script |

### 7.4 Scalability Considerations

- **Cell Model**: Each credential is one cell. 1 million credentials = 1 million cells
- **Query Performance**: Need ckb-indexer for efficient credential lookup
- **Capacity Costs**: ~100-200 CKBytes per credential DOB

---

## 8. Differentiation from Existing Solutions

### 8.1 vs. Traditional Credential Systems

| Aspect | Traditional | CKB DOB Credentials |
|--------|-------------|---------------------|
| Issuer Control | Full control | Can revoke but cannot seize |
| Transferability | N/A | Optional |
| Verification | Centralized database | On-chain, trustless |
| Fees | Platform fees | Near-zero |
| Data Storage | Off-chain, siloed | On-chain, verifiable |
| Interoperability | Low | High (CKB standard) |

### 8.2 vs. Ethereum NFT Credentials

| Aspect | ERC-721 NFTs | CKB DOB Credentials |
|--------|--------------|---------------------|
| Transfer Fees | Gas required | Zero fees |
| Content Storage | Usually IPFS/centralized | Fully on-chain |
| Credential Semantics | Generic NFT | Semantic clustering |
| Verification | External indexer | Native cell query |
| Soulbound | ERC-5192 complex | Simple Type Script |

### 8.3 vs. POAP

| Aspect | POAP | CKB DOB Credentials |
|--------|------|---------------------|
| Chain | Ethereum/Polygon | CKB |
| Transfer | Non-transferable | Configurable |
| Data Model | Custom JSON | W3C VC compatible |
| Fees | Gas fees | Zero fees |
| Verification | Centralized API | Trustless on-chain |

---

## 9. Security Considerations

### 9.1 On-Chain Security

- **Credential Ownership**: Locked by holder's wallet (secp256k1/Omnilock)
- **Issuer Authentication**: Cluster type script verifies issuer signature
- **Data Integrity**: DNA is immutable after issuance

### 9.2 Potential Risks

| Risk | Mitigation |
|------|------------|
| Fake Issuers | Credential verification includes issuer Cluster check |
| Credential Replay | Include timestamp/nonce in credential ID |
| Data Privacy | Use zero-knowledge proofs for selective disclosure |
| Sybil Attacks | Integrate with JoyID or other identity systems |

### 9.3 Privacy Considerations

- Credentials reveal holder address
- Consider: Zero-knowledge proof integration for selective disclosure
- Alternative: Use stealth addresses for credential collection

---

## 10. Implementation Recommendations

### 10.1 MVP Scope (Weeks 9-10)

1. **Cluster Creation**: Issuer creates a credential Cluster
2. **Credential Issuance**: Mint DOB credentials to recipients
3. **Credential Display**: View credentials in wallet/profile
4. **Basic Verification**: Query chain to verify credential exists

### 10.2 Extended Features (Weeks 11-12)

1. **Non-Transferable Script**: Custom Type Script preventing transfers
2. **Expiration Mechanism**: Time-based credential validity
3. **Revocation System**: Issuer can mark credentials as revoked
4. **Credential Verification API**: Backend service for verification

### 10.3 Future Enhancements

- Zero-knowledge proofs for selective disclosure
- Integration with RGB++ for Bitcoin-native credentials
- Credential bundles (multiple credentials in one presentation)
- Verification scoring (similar to Gitcoin Passport)

---

## 11. Conclusion

The DOB Credential & Badge Protocol is a technically feasible and community-relevant project that leverages CKB's unique advantages (zero fees, on-chain storage, Spore Protocol) to create a self-sovereign credential system. The project:

✅ Builds on existing, tested infrastructure (Spore, CCC SDK)
✅ Addresses real pain points in credential verification
✅ Showcases CKB's unique advantages
✅ Is achievable within the 4-week capstone timeline
✅ Has clear differentiation from existing solutions

### 11.1 Recommendation

**Proceed with implementation**, starting with the MVP scope:
1. Cluster-based credential issuance
2. W3C VC-compatible credential DNA
3. Basic verification functionality
4. Frontend wallet integration

The non-transferable and revocation features can be added as the project progresses.

---

## References

### CKB Documentation
- [CKB Cell Model](https://docs.nervos.org/docs/ckb-fundamentals/cell-model)
- [Spore Protocol](https://docs.spore.pro/)
- [DOB/0 Protocol](https://docs.spore.pro/dob/dob0-protocol)
- [CCC SDK](https://docs.ckbccc.com)
- [Spore SDK](https://github.com/sporeprotocol/spore-sdk)

### Credential Standards
- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [ERC-5192 Soulbound Tokens](https://eips.ethereum.org/EIPS/eip-5192)
- [Gitcoin Passport](https://passport.gitcoin.co/)

### Related Projects
- [POAP (Proof of Attendance Protocol)](https://poap.xyz/)
- [ENS (Ethereum Name Service)](https://ens.domains/)
- [BrightID](https://www.brightid.org/)

---

*Document Version: 1.0*
*Last Updated: 2026-08-11*
