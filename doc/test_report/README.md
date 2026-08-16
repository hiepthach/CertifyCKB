# Test Report

Test documentation for CKB Credential Registry.

## Files

| File | Description |
|------|-------------|
| [TEST_REPORT.md](./TEST_REPORT.md) | Detailed test results and coverage |

## Test Structure

```
tests/
├── setup.ts                 # Global test setup & mocks
└── unit/
    ├── ckb/
    │   └── config.test.ts  # Network config tests (13 tests)
    └── credentials/
        ├── encoder.test.ts  # W3C VC encoding tests (9 tests)
        ├── decoder.test.ts  # W3C VC decoding tests (22 tests)
        ├── batch.test.ts   # Batch issuance tests (14 tests)
        ├── cluster.test.ts  # Cluster validation tests (9 tests)
        └── verifier.test.ts # Verification logic tests (11 tests)
```

## Summary

| Metric | Value |
|--------|-------|
| Total Test Files | 6 |
| Total Tests | 78 |
| Passed | 78 |
| Failed | 0 |

## Run Tests

```bash
npm test
```

## Status

✅ All tests passing
