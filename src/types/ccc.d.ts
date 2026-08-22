import type { ccc } from '@ckb-ccc/core';

// Extend SignerInfo type from @ckb-ccc/core
declare module '@ckb-ccc/core' {
  interface SignerInfo {
    address?: {
      addressStr: string;
      script?: {
        codeHash: string;
        hashType: string;
        args: string;
      };
    };
    signer?: ccc.Signer;
  }
}

// For client.findCells with ScriptLike
export type { ccc };
