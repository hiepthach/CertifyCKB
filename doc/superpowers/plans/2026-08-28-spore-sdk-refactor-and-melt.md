# Spore SDK Refactor + Melt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw `ccc.Transaction` cell creation in `issueCertificate` and `createCluster` with `@spore-sdk/core` APIs (`spore.createSpore`, `cluster.createCluster`), and add `meltCertificate` so certificate holders can destroy their certificate cell and reclaim CKB.

**Architecture:** `getSporeConfig()` is fixed to return real config from `@spore-sdk/core`. On-chain issuance and cluster creation delegate to Spore SDK which handles capacity, fees, and cell deps. Melt verifies holder ownership via lock script comparison, then calls `spore.destroySpore`.

**Tech Stack:** TypeScript, `@spore-sdk/core@0.2.2-alpha.2`, `@ckb-ccc/core@1.1.8`, Vitest

**Spec:** `doc/superpowers/specs/2026-08-28-spore-sdk-refactor-and-melt-design.md`

---

## Global Constraints

- Use `cluster.createCluster` for cluster creation — never raw `ccc.Transaction`
- Use `spore.createSpore` for certificate issuance — never raw `ccc.Transaction`
- Melt is holder-only — ownership verified before any on-chain call
- Mock mode must continue working — `sendTransaction` absent on signer means mock path
- All function return types unchanged for existing callers

---

## File Map

| File | Role |
|---|---|
| `src/lib/ckb/config.ts` | Fix `getSporeConfig()` to return real `SporeConfig` |
| `src/lib/ckb/index.ts` | Re-export `spore` and `cluster` from `@spore-sdk/core` |
| `src/lib/credentials/issuer.ts` | Refactor `issueCertificate`, add `meltCertificate` |
| `src/lib/credentials/cluster.ts` | Refactor `createCluster` to use `cluster.createCluster` |
| `tests/unit/credentials/issuer.test.ts` | Add `meltCertificate` tests |

---

## Task 1: Fix `getSporeConfig()` — `src/lib/ckb/config.ts`

**Files:**
- Modify: `src/lib/ckb/config.ts`

**Context:** `getSporeConfig()` currently returns `undefined`. The `@spore-sdk/core` package exports a `config` object with both testnet and mainnet `SporeConfig`.

- [ ] **Step 1: Read current config.ts**

- [ ] **Step 2: Update the import and body of `getSporeConfig`**

```typescript
// OLD (broken)
import type { SporeConfig } from '@spore-sdk/core';

export function getSporeConfig(): SporeConfig {
  return undefined as unknown as SporeConfig;
}

// NEW
import { config, type SporeConfig } from '@spore-sdk/core';

export function getSporeConfig(): SporeConfig {
  const network = getNetwork();
  return network === 'mainnet' ? config.mainnet : config.testnet;
}
```

Note: Remove the `type` keyword-only import from the old line — `SporeConfig` is now imported from `@spore-sdk/core` as a value for the return type annotation. The import of `Network` and `NetworkConfig` from `@/types` stays.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (no SporeConfig type errors)

- [ ] **Step 4: Commit**

```bash
git add src/lib/ckb/config.ts
git commit -m "fix: return real SporeConfig from getSporeConfig()"
```

---

## Task 2: Refactor `issueCertificate` to use `spore.createSpore` — `src/lib/credentials/issuer.ts`

**Files:**
- Modify: `src/lib/credentials/issuer.ts`
- Consumes: `getSporeConfig()` from `src/lib/ckb/config.ts`

**Goal:** Replace the raw `ccc.Transaction` block with `spore.createSpore`. Keep all existing validation and error handling.

- [ ] **Step 1: Read current issuer.ts (full file)**

Focus on lines 87–172 (the `issueCertificate` function body inside the live signer branch).

- [ ] **Step 2: Add `spore` import from `@spore-sdk/core`**

```typescript
// Add to existing import from '@spore-sdk/core' (currently only imports types)
import { spore } from '@spore-sdk/core';
```

- [ ] **Step 3: Replace the raw transaction block**

In `issueCertificate`, inside the `if (signer && typeof signer === 'object' && 'client' in signer && typeof (signer as any).sendTransaction === 'function')` block, replace the entire raw CCC transaction section (lines ~134–161) with:

```typescript
    // Fail-Fast: validate recipient address (keep existing validation)
    const recipientAddr = subject.id || '';
    if (!recipientAddr) {
      throw new Error('Recipient CKB address is required');
    }

    let recipientLock: ccc.Script;
    try {
      const AddressClass = Address || ccc?.Address;
      const addrObj = await AddressClass.fromString(recipientAddr, liveSigner.client);
      recipientLock = addrObj.script;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid recipient CKB address "${recipientAddr}": ${errMsg}`);
    }

    // Build the DNA payload (same as before — dnaJson is already computed above)
    const dataBytes = ccc.bytesFrom(new TextEncoder().encode(dnaJson));

    try {
      // Use Spore SDK to create the certificate DOB cell
      const { txHash } = await spore.createSpore({
        data: {
          ...dna,
          _internal_: {
            version: '0x0',
          },
        },
        fromInfo: recipientAddr,
        config: getSporeConfig(),
        cellProvider: liveSigner.client,
      });

      // Save to local storage for quick retrieval & caching
      syncCertificatesFromLocalStorage();
      mockCertificates.set(certificateId, { certificate: dna, txHash });
      syncCertificatesToLocalStorage();

      return {
        certificateId,
        transactionHash: txHash,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~150 CKB to mint an on-chain DOB credential cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }
```

**Key differences from current code:**
- The `recipientLock` block (lines 125–133) stays — it's the address validation, not the transaction
- The old raw `ccc.Transaction` + `completeInputsByCapacity` + `completeFeeBy` + `sendTransaction` block is replaced by a single `spore.createSpore` call
- `spore.createSpore` takes `fromInfo: recipientAddr` — this sets the cell lock to the recipient (same as current behavior)
- The local-storage save and return remain at the end

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Run existing issuer tests**

Run: `npm test -- --run tests/unit/credentials/issuer.test.ts`
Expected: All existing tests PASS (the mock signer path is unaffected by this change)

- [ ] **Step 6: Commit**

```bash
git add src/lib/credentials/issuer.ts
git commit -m "refactor(issuer): use spore.createSpore instead of raw ccc.Transaction"
```

---

## Task 3: Refactor `createCluster` to use `cluster.createCluster` — `src/lib/credentials/cluster.ts`

**Files:**
- Modify: `src/lib/credentials/cluster.ts`
- Consumes: `getSporeConfig()` from `src/lib/ckb/config.ts`

**Goal:** Replace the raw `ccc.Transaction` block with `cluster.createCluster`. Keep mock mode unchanged.

- [ ] **Step 1: Read current cluster.ts (full file)**

Focus on lines 51–128 (the `createCluster` function body inside the live signer branch).

- [ ] **Step 2: Add `cluster` import from `@spore-sdk/core`**

```typescript
// Add to existing imports at top of cluster.ts
import { cluster } from '@spore-sdk/core';
```

- [ ] **Step 3: Replace the raw transaction block in `createCluster`**

In the live signer branch (after getting `creatorAddress` and `creatorLock`), replace the raw transaction section (lines ~71–108) with:

```typescript
    // Encode cluster metadata — same JSON structure as before
    const clusterMetadata = {
      name: config.name,
      description: config.description,
      websiteUrl: config.websiteUrl || '',
      contactEmail: config.contactEmail || '',
    };

    try {
      // Use Spore SDK to create the cluster cell
      const { txHash } = await cluster.createCluster({
        data: clusterMetadata,
        fromInfos: [creatorAddress],
        config: getSporeConfig(),
        cellProvider: liveSigner.client,
      });

      const clusterId = txHash;

      const clusterObj: Cluster = {
        id: clusterId,
        clusterId,
        name: config.name,
        description: config.description,
        websiteUrl: config.websiteUrl,
        contactEmail: config.contactEmail,
        creatorAddress,
        createdAt: new Date().toISOString(),
      };

      saveClusterToMockStorage(clusterObj);

      return {
        clusterId,
        transactionHash: txHash,
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('capacity') || msg.includes('balance') || msg.includes('Inputs') || msg.includes('LiveCells')) {
        throw new Error(
          `Insufficient CKB capacity in wallet. You need at least ~100 CKB to create an on-chain Cluster cell. Please claim free testnet CKB from https://faucet.nervos.org.`
        );
      }
      throw err;
    }
```

**Key differences:**
- `cluster.createCluster` takes `fromInfos: [creatorAddress]` and handles capacity automatically
- No need for `ccc.CellOutput`, `ccc.fixedPointFrom`, `ccc.Transaction`, `completeInputsByCapacity`, `completeFeeBy`
- The mock fallback (lines 130+) stays unchanged

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Run existing cluster tests**

Run: `npm test -- --run tests/unit/credentials/cluster.test.ts`
Expected: All existing tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/credentials/cluster.ts
git commit -m "refactor(cluster): use cluster.createCluster instead of raw ccc.Transaction"
```

---

## Task 4: Add `meltCertificate` — `src/lib/credentials/issuer.ts`

**Files:**
- Modify: `src/lib/credentials/issuer.ts`
- Test: `tests/unit/credentials/issuer.test.ts`
- Consumes: `getSporeConfig()` from `src/lib/ckb/config.ts`

**Goal:** Add new exported function `meltCertificate(signer, certificateId)` that destroys the holder's certificate cell and reclaims CKB.

- [ ] **Step 1: Write the failing tests**

Add to `tests/unit/credentials/issuer.test.ts`, inside the existing `describe('Certificate Service (Issuer)')` block, a new `describe('meltCertificate')` section:

```typescript
describe('meltCertificate', () => {
  beforeEach(() => {
    clearMockCertificates();
  });

  // Test: melts certificate and removes from storage
  it('should melt certificate and remove from local storage', async () => {
    // Issue a certificate first (mock signer path)
    const issued = await issueCertificate({
      signer: {},
      clusterId: testClusterId,
      issuerName: testIssuerName,
      subject: { id: validRecipientAddress, type: 'CourseCertificate', courseName: 'Test', completionDate: '2024-01-01' },
    });

    // Verify it exists before melting
    const before = await getCertificate(issued.certificateId);
    expect(before).not.toBeNull();

    // Melt with a mock live signer (simulates holder's wallet)
    const mockHolderSigner = {
      client: {},
      sendTransaction: vi.fn().mockResolvedValue('0x' + 'c'.repeat(64)),
      getRecommendedAddressObj: vi.fn().mockResolvedValue({
        toString: () => validRecipientAddress,
        script: { args: '0x1234', codeHash: '0xabcd', hashType: 'type' },
      }),
    };

    // Mock getCell to return a cell owned by the holder
    vi.spyOn(ccc.Client.prototype as any, 'getCell').mockResolvedValue({
      output: {
        lock: { args: validRecipientAddress, codeHash: '0xabcd', hashType: 'type' },
      },
      outPoint: { txHash: issued.transactionHash, index: '0x0' },
    });

    const { meltCertificate } = await import('../../../src/lib/credentials/issuer');
    const result = await meltCertificate(mockHolderSigner, issued.certificateId);

    expect(result.transactionHash).toBeDefined();
    expect(result.transactionHash).toMatch(/^0x[a-f0-9]+$/);

    // Verify removed from storage
    const after = await getCertificate(issued.certificateId);
    // In mock mode, meltCertificate deletes from storage
    expect(after).toBeNull();
  });

  // Test: throws if no live signer
  it('should throw if signer is not a live signer', async () => {
    const { meltCertificate } = await import('../../../src/lib/credentials/issuer');
    await expect(
      meltCertificate({}, '0x' + 'a'.repeat(64))
    ).rejects.toThrow('Live signer is required to melt a certificate');
  });

  // Test: throws if certificate not found
  it('should throw if certificate not found', async () => {
    const mockSigner = {
      client: {},
      sendTransaction: vi.fn(),
      getRecommendedAddressObj: vi.fn().mockResolvedValue({
        toString: () => validRecipientAddress,
        script: { args: '0x1234', codeHash: '0xabcd', hashType: 'type' },
      }),
    };

    const { meltCertificate } = await import('../../../src/lib/credentials/issuer');
    await expect(
      meltCertificate(mockSigner, '0x' + 'f'.repeat(64))
    ).rejects.toThrow('Certificate not found');
  });
});
```

**Note:** The `vi.spyOn(ccc.Client.prototype, 'getCell')` approach may need adjustment depending on how `@ckb-ccc/core` exports `Client`. If `ccc.Client` is not directly constructible in tests, use a simpler approach: mock `spore.destroySpore` directly using `vi.spyOn(spore, 'destroySpore')` and verify it was called with the correct `outPoint`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/unit/credentials/issuer.test.ts`
Expected: FAIL — `meltCertificate is not exported`

- [ ] **Step 3: Implement `meltCertificate` in issuer.ts**

Add the function to `src/lib/credentials/issuer.ts` (after `revokeCertificate`, around line 508):

```typescript
/**
 * Melt (destroy) a certificate cell to reclaim CKB capacity.
 * Only the certificate holder can melt their own certificate.
 *
 * @param signer - The holder's wallet signer (must be a live signer)
 * @param certificateId - The certificate ID to melt
 */
export async function meltCertificate(
  signer: unknown,
  certificateId: string
): Promise<{ transactionHash: string }> {
  // Fail-Fast: require live signer
  if (
    !signer ||
    typeof signer !== 'object' ||
    !('client' in signer) ||
    typeof (signer as any).sendTransaction !== 'function'
  ) {
    throw new Error('Live signer is required to melt a certificate');
  }

  const liveSigner = signer as ccc.Signer;

  // Look up the certificate to get the transaction hash
  const certRecord = await getCertificate(certificateId);
  if (!certRecord) {
    throw new Error('Certificate not found');
  }

  const txHash = certRecord.transactionHash;
  if (!txHash) {
    throw new Error('Certificate has no on-chain transaction hash');
  }

  // Get holder's address and lock script
  const addrObj = await liveSigner.getRecommendedAddressObj();
  const holderAddress = addrObj.toString();
  const holderLock = addrObj.script;

  // Verify the holder owns this certificate cell
  const ckbClient = liveSigner.client;
  let holderOwnsCell = false;

  try {
    const cell = await ckbClient.getCell({ txHash, index: 0 });
    if (cell?.output?.lock) {
      // Compare lock scripts: match if both codeHash+hashType+args are equal
      const cellLock = cell.output.lock;
      holderOwnsCell =
        cellLock.codeHash === holderLock.codeHash &&
        cellLock.hashType === holderLock.hashType &&
        cellLock.args === holderLock.args;
    }
  } catch {
    // Cell not found on-chain
    throw new Error('Certificate cell not found on-chain');
  }

  if (!holderOwnsCell) {
    throw new Error('Only the certificate holder can melt this certificate');
  }

  // Use Spore SDK to destroy the certificate cell
  const { txHash: meltTxHash } = await spore.destroySpore({
    outPoint: { txHash, index: 0 },
    fromInfo: holderAddress,
    config: getSporeConfig(),
    cellProvider: ckbClient,
  });

  // Remove from local storage
  syncCertificatesFromLocalStorage();
  mockCertificates.delete(certificateId);
  syncCertificatesToLocalStorage();

  return { transactionHash: meltTxHash };
}
```

**Notes:**
- Import `spore` from `@spore-sdk/core` if not already added in Task 2
- The `spore.destroySpore` call is the on-chain destruction
- The `getCertificate` call uses the local cache — works for both mock and on-chain certificates

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run tests/unit/credentials/issuer.test.ts`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `npm test -- --run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/credentials/issuer.ts tests/unit/credentials/issuer.test.ts
git commit -m "feat: add meltCertificate for holders to reclaim CKB capacity"
```

---

## Task 5: Update `ckb/index.ts` re-exports — `src/lib/ckb/index.ts`

**Files:**
- Modify: `src/lib/ckb/index.ts`

**Goal:** Ensure `spore` and `cluster` are properly re-exported from `@spore-sdk/core` for consumers.

- [ ] **Step 1: Read current ckb/index.ts**

- [ ] **Step 2: Verify exports include `spore` and `cluster`**

Current file already has:
```typescript
export { cluster, createCluster, getClusterByType, getClusterById, getClusterProxyByType, getSporeConfig } from '@spore-sdk/core';
```

Check if `spore` is also exported (for the `meltCertificate` function that imports it). If `spore` is missing from the re-exports, add it:

```typescript
export { cluster, spore, createCluster, getClusterByType, getClusterById, getClusterProxyByType, getSporeConfig } from '@spore-sdk/core';
```

Note: The `issuer.ts` and `cluster.ts` should import directly from `@spore-sdk/core` (not from `ckb/index.ts`) to keep the re-export clean. Only verify the re-export exists for external consumers.

- [ ] **Step 3: Run typecheck and tests**

Run: `npm run typecheck && npm test -- --run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ckb/index.ts
git commit -m "chore: add spore to ckb/index.ts re-exports"
```

---

## Post-Implementation Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test -- --run` — all tests pass
- [ ] `npm run build` — production build succeeds
- [ ] Verify `getSporeConfig()` returns non-undefined config
- [ ] Verify `meltCertificate` is exported from `issuer.ts`
