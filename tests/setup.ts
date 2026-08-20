import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock crypto.getRandomValues for tests
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as unknown as { crypto: Crypto }).crypto = {
    getRandomValues: (array: Uint8Array): Uint8Array => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  } as Crypto;
}

// Mock File class for jsdom
class MockFile extends Blob {
  name: string;
  lastModified: number;

  constructor(parts: (string | Blob)[], fileName: string, options?: { type?: string }) {
    const content = parts.map(p => typeof p === 'string' ? p : '').join('');
    super([content], { type: options?.type || '' });
    this.name = fileName;
    this.lastModified = Date.now();
  }
}

// Make MockFile available globally
(globalThis as unknown as { File: typeof MockFile }).File = MockFile;

// Mock crypto.randomUUID
if (!('randomUUID' in globalThis.crypto)) {
  (globalThis.crypto as unknown as { randomUUID: () => string }).randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

// Mock fetch
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = async () => {
    throw new Error('fetch not implemented');
  };
}

// Mock @spore-sdk/core
vi.mock('@spore-sdk/core', () => ({
  createCluster: vi.fn().mockResolvedValue({
    txHash: '0x' + '0'.repeat(64),
    clusterId: '0x' + '1'.repeat(64),
  }),
  getCluster: vi.fn(),
  createSporeCell: vi.fn().mockResolvedValue({
    txHash: '0x' + '0'.repeat(64),
  }),
  getSporeCell: vi.fn(),
  setSporeConfig: vi.fn(),
}));

// Mock @ckb-ccc/core
vi.mock('@ckb-ccc/core', () => ({
  ccc: {
    ClientPublicTestnet: vi.fn().mockImplementation(() => ({})),
    ClientPublicMainnet: vi.fn().mockImplementation(() => ({})),
    ClientPublicRpc: vi.fn().mockImplementation(() => ({})),
  },
}));
