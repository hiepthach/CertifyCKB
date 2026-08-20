'use client';

import { useState, useEffect } from 'react';
import { useCcc } from '@ckb-ccc/connector-react';
import type { ccc } from '@ckb-ccc/core';

export function useWallet() {
  const { disconnect, client, signerInfo } = useCcc();
  const [balance, setBalance] = useState<bigint | null>(null);

  const address = signerInfo?.address?.addressStr ?? null;

  useEffect(() => {
    if (!address || !client) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceResult = await client.getBalance(address as unknown as Parameters<typeof client.getBalance>[0]);
        setBalance(balanceResult);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    };

    fetchBalance();
  }, [address, client]);

  return {
    address,
    signerInfo,
    isConnected: !!address,
    disconnect,
    balance,
  };
}
