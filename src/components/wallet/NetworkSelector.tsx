'use client';

import { useState, useRef, useEffect } from 'react';
import { useNetwork, Network } from '@/hooks/useNetwork';
import { Globe, ChevronDown, Check, AlertTriangle } from 'lucide-react';

const NETWORK_CONFIG = {
  testnet: {
    label: 'Testnet (Aggron)',
    icon: '🧪',
    variant: 'info' as const,
    description: 'Nervos test network',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
  },
  mainnet: {
    label: 'Mainnet',
    icon: '⚡',
    variant: 'success' as const,
    description: 'CKB production network',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
  },
};

interface NetworkSelectorProps {
  className?: string;
}

export function NetworkSelector({ className = '' }: NetworkSelectorProps) {
  const { network, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = NETWORK_CONFIG[network];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSelect = (newNetwork: Network) => {
    setNetwork(newNetwork);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
          ${isOpen
            ? 'bg-slate-700 border-blue-500'
            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }
        `}
      >
        <span className="text-base">{currentConfig.icon}</span>
        <span className="text-sm font-medium text-white hidden sm:inline">
          {currentConfig.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-700 bg-slate-900/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Select Network</p>
          </div>
          <div className="p-2">
            {(Object.keys(NETWORK_CONFIG) as Network[]).map((net) => {
              const config = NETWORK_CONFIG[net];
              const isSelected = net === network;

              return (
                <button
                  key={net}
                  onClick={() => handleNetworkSelect(net)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                    ${isSelected
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
                      : 'text-slate-300 hover:bg-slate-700/50 border border-transparent'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-full ${config.bgColor} bg-opacity-20 flex items-center justify-center`}>
                    <span className="text-xl">{config.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{config.label}</p>
                    <p className="text-xs text-slate-500">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    {net === 'mainnet' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                        LIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning for mainnet */}
          {network === 'mainnet' && (
            <div className="mx-3 mb-3 p-2 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300">
                You are connected to mainnet. Real transactions will occur.
              </p>
            </div>
          )}

          <div className="p-2 border-t border-slate-700 bg-slate-900/30">
            <p className="text-xs text-slate-500 text-center">
              Settings are saved locally
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple badge version
export function NetworkBadge() {
  const { network } = useNetwork();
  const config = NETWORK_CONFIG[network];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor} bg-opacity-20 border border-slate-700`}>
      <span className="text-sm">{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

// Status dot version
export function NetworkStatusDot() {
  const { network } = useNetwork();
  const config = NETWORK_CONFIG[network];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.bgColor} animate-pulse`} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
