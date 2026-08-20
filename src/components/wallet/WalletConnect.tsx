'use client';

import { useCcc } from '@ckb-ccc/connector-react';
import type { ccc } from '@ckb-ccc/core';
import { Button } from '@/components/ui';
import { Wallet, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const { disconnect, client, signerInfo, open } = useCcc();
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
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [address, client]);

  const truncateAddress = (addr: string): string => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCKB = (shannons: bigint): string => {
    const ckb = Number(shannons) / 1e8;
    return ckb.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (!address) {
    return (
      <Button variant="primary" onClick={() => open()}>
        <Wallet className="w-4 h-4" />
        Connect
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {balance !== null && (
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {formatCKB(balance)} CKB
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
        <Wallet className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-mono text-white">
          {truncateAddress(address)}
        </span>
      </div>

      <Button variant="ghost" size="sm" onClick={() => disconnect()}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
