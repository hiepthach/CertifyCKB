'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCcc } from '@ckb-ccc/connector-react';
import type { ccc } from '@ckb-ccc/core';

interface UseWalletResult {
  address: string | null;
  signer: ccc.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: bigint | null;
  refreshBalance: () => Promise<void>;
}

export function useWallet(): UseWalletResult {
  const { signer, address, client, disconnect } = useCcc();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

  // Fetch balance when address changes
  const refreshBalance = useCallback(async () => {
    if (!address || !client) return;

    try {
      const balanceResult = await client.getBalance(address);
      setBalance(balanceResult);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, [address, client]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // The actual connection is handled by the Connector component
      // This function is just for triggering the connection flow
      if (!signer) {
        throw new Error('No signer available. Please install a wallet extension.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [signer]);

  return {
    address,
    signer,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect: () => {
      disconnect();
      setBalance(null);
    },
    balance,
    refreshBalance,
  };
}
