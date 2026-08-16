'use client';

import { useCcc } from '@ckb-ccc/connector-react';
import { Button, Badge } from '@/components/ui';
import { Wallet, LogOut, RefreshCw } from 'lucide-react';
import { truncateAddress, formatCKB } from '@/utils';
import { NETWORK_DISPLAY_NAMES } from '@/lib/ckb';
import { useNetwork } from '@/hooks';

interface WalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
  compact?: boolean;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  showBalance = true,
  compact = false,
}: WalletConnectProps) {
  const { address, signer, disconnect, isSupportedChain } = useCcc();
  const { network, isDevnet } = useNetwork();
  const { balance, refreshBalance } = useBalance(address);

  if (!address) {
    return (
      <Button variant="primary" onClick={onConnect}>
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network badge */}
      {!compact && (
        <Badge variant={isDevnet ? 'warning' : 'success'}>
          {NETWORK_DISPLAY_NAMES[network]}
        </Badge>
      )}

      {/* Balance */}
      {showBalance && balance !== null && !compact && (
        <div className="text-right">
          <div className="text-sm font-medium text-white">
            {formatCKB(balance)} CKB
          </div>
        </div>
      )}

      {/* Address */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-mono text-white">
            {truncateAddress(address, 6, 4)}
          </span>
        </div>
        {!compact && (
          <button
            onClick={() => refreshBalance()}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Disconnect */}
      <Button variant="ghost" size="sm" onClick={onDisconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Helper hook for balance
function useBalance(address: string | null) {
  const { client } = useCcc();
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!address || !client) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceResult = await client.getBalance(address);
        setBalance(balanceResult);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [address, client]);

  const refreshBalance = async () => {
    if (!address || !client) return;
    try {
      const balanceResult = await client.getBalance(address);
      setBalance(balanceResult);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  return { balance, refreshBalance };
}
