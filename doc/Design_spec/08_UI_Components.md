# UI Components — Unit Design

## 1. Overview

| Item | Details |
|------|---------|
| **Module** | UI Components |
| **Files** | `src/components/**/*.tsx` |
| **Purpose** | Reusable React components for the credential registry |
| **Dependencies** | React, Tailwind CSS |

---

## 2. Component Structure

```
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Badge.tsx
│   ├── Spinner.tsx
│   └── EmptyState.tsx
├── wallet/
│   └── WalletConnect.tsx
├── cluster/
│   ├── ClusterCard.tsx
│   ├── ClusterForm.tsx
│   └── ClusterList.tsx
├── certificate/
│   ├── CertificateCard.tsx
│   ├── CertificateDetail.tsx
│   ├── CertificateForm.tsx
│   └── CertificateList.tsx
├── template/
│   ├── TemplateCard.tsx
│   └── TemplateForm.tsx
├── verification/
│   ├── VerifyForm.tsx
│   └── VerifyResult.tsx
└── batch/
    ├── BatchUpload.tsx
    └── BatchPreview.tsx
```

---

## 3. UI Primitives

### 3.1 Button

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

**Variants**:
| Variant | Use Case |
|---------|----------|
| `primary` | Main actions (Issue, Create) |
| `secondary` | Secondary actions (Cancel, Back) |
| `danger` | Destructive actions (Revoke, Delete) |
| `ghost` | Tertiary actions (Copy, View) |

### 3.2 Card

**Props**:
```typescript
interface CardProps {
  variant?: 'default' | 'highlighted' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### 3.3 Input

**Props**:
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'email';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}
```

### 3.4 Badge

**Props**:
```typescript
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}
```

**Variants**:
| Variant | Color | Use Case |
|---------|-------|----------|
| `success` | Green | Active, Valid |
| `warning` | Yellow | Expiring, Pending |
| `danger` | Red | Expired, Revoked, Error |
| `info` | Blue | Informational |
| `neutral` | Gray | Default |

### 3.5 Spinner

**Props**:
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}
```

### 3.6 EmptyState

**Props**:
```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 4. Wallet Components

### 4.1 WalletConnect

**Purpose**: Connect wallet and display connection status.

**States**:
```mermaid
graph LR
    DISCONNECTED["Disconnected"]
    CONNECTING["Connecting..."]
    CONNECTED["Connected"]
    ERROR["Error"]

    DISCONNECTED -->|"Click Connect"| CONNECTING
    CONNECTING -->|"Success"| CONNECTED
    CONNECTING -->|"Error"| ERROR
    CONNECTED -->|"Click Disconnect"| DISCONNECTED
    ERROR -->|"Retry"| CONNECTING
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [WalletIcon]  ckt1q...xyz123          [Disconnect]   │
│                Balance: 1000 CKB                       │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface WalletConnectProps {
  onConnect?: (signer: ccc.Signer) => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
}
```

---

## 5. Cluster Components

### 5.1 ClusterCard

**Purpose**: Display cluster summary in a card.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  📜 CKB Academy                                         │
│  Course certificate provider                             │
│                                                         │
│  Certificates Issued: 42                               │
│  Created: Jan 15, 2024                                  │
│                                                         │
│  [Manage]  [Issue Certificate]                         │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface ClusterCardProps {
  cluster: Cluster;
  certificateCount?: number;
  onManage?: () => void;
  onIssue?: () => void;
}
```

### 5.2 ClusterForm

**Purpose**: Form to create/edit a cluster.

**Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text | Yes | 1-100 chars |
| Description | textarea | Yes | 1-500 chars |
| Website URL | text | No | Valid URL |
| Contact Email | email | No | Valid email |

**Props**:
```typescript
interface ClusterFormProps {
  initialValues?: Partial<ClusterConfig>;
  onSubmit: (data: ClusterConfig) => void;
  onCancel?: () => void;
  loading?: boolean;
}
```

---

## 6. Certificate Components

### 6.1 CertificateCard

**Purpose**: Display certificate summary in a card.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  🎓 CKB Development Fundamentals                        │
│  CKB Academy • Completed Jan 15, 2024                  │
│                                                         │
│  Grade: A    Skills: Rust, CKB-VM                    │
│                                                         │
│  [Valid ✅]                      [View Details]        │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface CertificateCardProps {
  certificate: CertificateDNA;
  certificateId: string;
  status?: 'active' | 'expired' | 'revoked';
  onClick?: () => void;
  onShare?: () => void;
}
```

### 6.2 CertificateDetail

**Purpose**: Display full certificate details.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                        CERTIFICATE                       │
│                    🎓 Verified                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  CKB Development Fundamentals                     │  │
│  │  CKB Academy                                     │  │
│  │  Completed: January 15, 2024                     │  │
│  │  Grade: A                                       │  │
│  │  Skills: Rust, CKB-VM, Cell Model              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Issuer: CKB Academy                                  │
│  Issued: Jan 15, 2024                                 │
│  Expires: Jan 15, 2025 (if set)                      │
│                                                         │
│  [Copy ID]  [Open in Explorer]  [Share]             │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface CertificateDetailProps {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  onCopyId?: () => void;
  onOpenExplorer?: () => void;
  onShare?: () => void;
}
```

### 6.3 CertificateForm

**Purpose**: Form to issue a new certificate.

**Fields**:
| Field | Type | Required | Source |
|-------|------|----------|--------|
| Recipient Address | text | Yes | User input |
| Course Name | text | Yes | Template/input |
| Completion Date | date | Yes | Template/input |
| Grade | select | No | Template |
| Skills | text | No | Template |

**Props**:
```typescript
interface CertificateFormProps {
  clusterId: string;
  template?: Template;
  onSubmit: (data: CertificateData) => void;
  onCancel?: () => void;
  loading?: boolean;
}
```

---

## 7. Verification Components

### 7.1 VerifyForm

**Purpose**: Form to input certificate ID for verification.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Verify Certificate                                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Enter Certificate ID                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Verify]                                              │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface VerifyFormProps {
  onVerify: (certificateId: string) => void;
  loading?: boolean;
}
```

### 7.2 VerifyResult

**Purpose**: Display verification result.

**States**:

**Valid Certificate**:
```
┌─────────────────────────────────────────────────────────┐
│                    ✅ Valid Certificate                 │
│                                                         │
│  Certificate ID: 0xabc...123                           │
│  Issuer: CKB Academy                                   │
│  Type: Course Certificate                              │
│  Issued: Jan 15, 2024                                │
│  Status: Active                                       │
│                                                         │
│  [View Details]                                       │
└─────────────────────────────────────────────────────────┘
```

**Invalid Certificate (Expired)**:
```
┌─────────────────────────────────────────────────────────┐
│                    ⚠️ Expired Certificate                │
│                                                         │
│  Certificate ID: 0xdef...456                           │
│  Expired: Jan 15, 2024                               │
│                                                         │
│  [View Details]                                       │
└─────────────────────────────────────────────────────────┘
```

**Not Found**:
```
┌─────────────────────────────────────────────────────────┐
│                    ❌ Certificate Not Found            │
│                                                         │
│  No certificate found with ID: 0x123...               │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface VerifyResultProps {
  result: VerificationResult;
  onViewDetails?: () => void;
}
```

---

## 8. Batch Components

### 8.1 BatchUpload

**Purpose**: Upload CSV/JSON file for batch issuance.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Batch Certificate Issuance                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │           📁 Drop file here                      │  │
│  │           or click to browse                    │  │
│  │                                                   │  │
│  │           Supports: CSV, JSON                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Download template: [CSV] [JSON]                      │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface BatchUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string[];
  maxSize?: number; // in bytes
}
```

### 8.2 BatchPreview

**Purpose**: Preview batch before issuing.

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Preview (3 certificates)                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │ # │ Address      │ Name   │ Course      │ Grade │  │
│  │ 1 │ ckt1q...    │ John   │ CKB 101     │ A     │  │
│  │ 2 │ ckt1q...    │ Jane   │ CKB 101     │ B+    │  │
│  │ 3 │ ckt1q...    │ Bob    │ CKB 101     │ A     │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Estimated Cost: ~453 CKB                              │
│                                                         │
│  [Cancel]                           [Issue 3]       │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface BatchPreviewProps {
  entries: BatchEntry[];
  estimatedCost: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
```

---

## 9. Common Patterns

### 9.1 Loading States

```typescript
// Button with loading
<Button loading={isIssuing}>
  {isIssuing ? 'Issuing...' : 'Issue Certificate'}
</Button>

// Component with loading
{isLoading ? (
  <div className="flex justify-center py-8">
    <Spinner label="Loading certificates..." />
  </div>
) : (
  <CertificateList certificates={certificates} />
)}
```

### 9.2 Empty States

```typescript
// No certificates
<EmptyState
  icon="📜"
  title="No certificates yet"
  description="Certificates issued to you will appear here."
  action={{
    label: "Get Started",
    onClick: () => router.push('/'),
  }}
/>

// No clusters
<EmptyState
  icon="🏛️"
  title="No clusters created"
  description="Create a cluster to start issuing certificates."
  action={{
    label: "Create Cluster",
    onClick: () => setShowCreateModal(true),
  }}
/>
```

### 9.3 Error States

```typescript
// Error display
{error && (
  <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
    <p className="text-red-400">{error}</p>
    <Button variant="ghost" onClick={retry}>
      Try Again
    </Button>
  </div>
)}
```

---

## 10. Design Tokens

### 10.1 Colors

```typescript
const colors = {
  // Primary
  primary: 'bg-blue-600 hover:bg-blue-700',
  primaryText: 'text-blue-600',

  // Status
  success: 'bg-green-600',
  successText: 'text-green-400',
  warning: 'bg-yellow-600',
  warningText: 'text-yellow-400',
  danger: 'bg-red-600',
  dangerText: 'text-red-400',

  // Neutrals
  background: 'bg-slate-900',
  surface: 'bg-slate-800',
  border: 'border-slate-700',
  text: 'text-white',
  textSecondary: 'text-slate-400',
};
```

### 10.2 Spacing

```typescript
const spacing = {
  cardPadding: 'p-4 md:p-6',
  sectionGap: 'space-y-6',
  formGap: 'space-y-4',
  buttonGap: 'gap-3',
};
```

---

## 11. Related Documents

| Document | Path |
|----------|------|
| Implementation Architecture | `Design_spec/Implementation_Architecture.md` |
| Cluster Service | `Design_spec/01_Cluster_Service.md` |
| Certificate Service | `Design_spec/03_Certificate_Service.md` |

---

*Version: 1.0*
*Last Updated: 2026-08-11*
