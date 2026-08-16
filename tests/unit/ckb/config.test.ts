/**
 * CKB Config Tests - Network Configuration and Explorer URL Generation
 *
 * Tests for network configuration (devnet/testnet/mainnet),
 * explorer URL helpers, and script configurations.
 * Reference: Design_spec/07_CKB_Client.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CKB Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Network Configuration', () => {
    // Test: Default network is devnet
    // Input: No NEXT_PUBLIC_NETWORK env var set
    // Expected: getNetwork() returns 'devnet'
    it('should use devnet config by default', async () => {
      const { getNetwork, NETWORK_CONFIGS } = await import('../../../src/lib/ckb/config');

      const network = getNetwork();

      expect(network).toBe('devnet');
      expect(NETWORK_CONFIGS.devnet.ckbNodeUrl).toContain('localhost');
    });

    // Test: Switch to testnet when env var set
    // Input: NEXT_PUBLIC_NETWORK=testnet
    // Expected: getNetwork() returns 'testnet', config uses testnet URLs
    it('should use testnet config when set', async () => {
      process.env.NEXT_PUBLIC_NETWORK = 'testnet';

      const { getNetwork, NETWORK_CONFIGS } = await import('../../../src/lib/ckb/config');

      const network = getNetwork();

      expect(network).toBe('testnet');
      expect(NETWORK_CONFIGS.testnet.ckbNodeUrl).toContain('testnet');
    });

    // Test: Switch to mainnet when env var set
    // Input: NEXT_PUBLIC_NETWORK=mainnet
    // Expected: getNetwork() returns 'mainnet', config uses mainnet URLs
    it('should use mainnet config when set', async () => {
      process.env.NEXT_PUBLIC_NETWORK = 'mainnet';

      const { getNetwork, NETWORK_CONFIGS } = await import('../../../src/lib/ckb/config');

      const network = getNetwork();

      expect(network).toBe('mainnet');
      expect(NETWORK_CONFIGS.mainnet.ckbNodeUrl).toContain('mainnet');
    });
  });

  describe('Network Config', () => {
    // Test: Get network config returns correct URLs
    // Input: devnet network (default)
    // Expected: Returns config with ckbNodeUrl, ckbIndexerUrl, explorerUrl
    it('should return correct config for devnet', async () => {
      const { getNetworkConfig } = await import('../../../src/lib/ckb/config');

      const config = getNetworkConfig();

      expect(config.ckbNodeUrl).toBeDefined();
      expect(config.ckbIndexerUrl).toBeDefined();
      expect(config.explorerUrl).toBeDefined();
    });

    // Test: Testnet has explorer URL
    // Input: NEXT_PUBLIC_NETWORK=testnet
    // Expected: explorerUrl contains 'explorer'
    it('should have explorer URL for testnet', async () => {
      process.env.NEXT_PUBLIC_NETWORK = 'testnet';

      const { getNetworkConfig } = await import('../../../src/lib/ckb/config');

      const config = getNetworkConfig();

      expect(config.explorerUrl).toContain('explorer');
    });
  });

  describe('Explorer URL Helpers', () => {
    // Test: Generate transaction explorer URL
    // Input: Transaction hash '0x1234567890abcdef'
    // Expected: URL contains 'transaction/0x1234567890abcdef'
    it('should generate transaction URL', async () => {
      const { getTransactionUrl } = await import('../../../src/lib/ckb/config');

      const url = getTransactionUrl('0x1234567890abcdef');

      expect(url).toContain('transaction/0x1234567890abcdef');
    });

    // Test: Generate cell explorer URL
    // Input: Cell type hash '0xabcdef1234567890'
    // Expected: URL contains 'cell/0xabcdef1234567890'
    it('should generate cell URL', async () => {
      const { getCellUrl } = await import('../../../src/lib/ckb/config');

      const url = getCellUrl('0xabcdef1234567890');

      expect(url).toContain('cell/0xabcdef1234567890');
    });

    // Test: Generate address explorer URL
    // Input: CKB address
    // Expected: URL contains 'address/'
    it('should generate address URL', async () => {
      const { getAddressUrl } = await import('../../../src/lib/ckb/config');

      const url = getAddressUrl('ckt1q9gry5zgxmpjnmhrp4raggde4gf2vqqyzd5x3lt7pf5m8c2kzwfxnsvpq');

      expect(url).toContain('address/');
    });
  });

  describe('Network Display Names', () => {
    // Test: Get correct display names for all networks
    // Input: NETWORK_DISPLAY_NAMES object
    // Expected: devnet='Devnet (Local)', testnet='Testnet (Aggron)', mainnet='Mainnet'
    it('should return correct display names', async () => {
      const { NETWORK_DISPLAY_NAMES } = await import('../../../src/lib/ckb/config');

      expect(NETWORK_DISPLAY_NAMES.devnet).toBe('Devnet (Local)');
      expect(NETWORK_DISPLAY_NAMES.testnet).toBe('Testnet (Aggron)');
      expect(NETWORK_DISPLAY_NAMES.mainnet).toBe('Mainnet');
    });
  });

  describe('Devnet Scripts', () => {
    // Test: All script configs are defined
    // Input: DEVNET_SCRIPTS object
    // Expected: SPORE, SPORE_CLUSTER, SECP256K1_BLAKE160, OMNILOCK all defined
    it('should have correct script configs', async () => {
      const { DEVNET_SCRIPTS } = await import('../../../src/lib/ckb/config');

      expect(DEVNET_SCRIPTS.SPORE).toBeDefined();
      expect(DEVNET_SCRIPTS.SPORE_CLUSTER).toBeDefined();
      expect(DEVNET_SCRIPTS.SECP256K1_BLAKE160).toBeDefined();
      expect(DEVNET_SCRIPTS.OMNILOCK).toBeDefined();
    });

    // Test: Script hash types are correct
    // Input: DEVNET_SCRIPTS
    // Expected: SPORE uses 'data2', SPORE_CLUSTER uses 'data2',
    //           SECP256K1_BLAKE160 uses 'type'
    it('should have correct hash types', async () => {
      const { DEVNET_SCRIPTS } = await import('../../../src/lib/ckb/config');

      expect(DEVNET_SCRIPTS.SPORE.HASH_TYPE).toBe('data2');
      expect(DEVNET_SCRIPTS.SPORE_CLUSTER.HASH_TYPE).toBe('data2');
      expect(DEVNET_SCRIPTS.SECP256K1_BLAKE160.HASH_TYPE).toBe('type');
    });
  });

  describe('Get Explorer URL', () => {
    // Test: Devnet has no explorer
    // Input: NEXT_PUBLIC_NETWORK=devnet
    // Expected: Returns empty string
    it('should return empty URL for devnet', async () => {
      process.env.NEXT_PUBLIC_NETWORK = 'devnet';

      const { getExplorerUrl } = await import('../../../src/lib/ckb/config');

      const url = getExplorerUrl();

      expect(url).toBe('');
    });

    // Test: Testnet has explorer URL
    // Input: NEXT_PUBLIC_NETWORK=testnet
    // Expected: URL contains 'explorer'
    it('should return explorer URL for testnet', async () => {
      process.env.NEXT_PUBLIC_NETWORK = 'testnet';

      const { getExplorerUrl } = await import('../../../src/lib/ckb/config');

      const url = getExplorerUrl();

      expect(url).toContain('explorer');
    });
  });
});
