'use client';

import { useState, useRef, useEffect } from 'react';
import { useNetwork, Network } from '@/hooks/useNetwork';
import { Globe, ChevronDown, Check, AlertTriangle } from 'lucide-react';

const NETWORK_CONFIG = {
  testnet: {
    label: 'Testnet (Aggron)',
    description: 'Nervos test network',
    color: 'text-lavender',
    bgColor: 'bg-lavender/10',
    borderColor: 'border-lavender/30',
  },
  mainnet: {
    label: 'Mainnet',
    description: 'CKB production network',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
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
          flex items-center gap-1.5 px-3 py-1.5 rounded-btn border transition-all text-xs
          ${isOpen
            ? 'bg-deep-indigo border-lavender/50 text-lilac-white'
            : 'bg-deep-indigo/50 border-dusk/30 text-fog hover:text-lilac-white hover:border-dusk/50'
          }
        `}
      >
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${currentConfig.bgColor} ${currentConfig.color}`}>
          <Globe className="w-2.5 h-2.5" strokeWidth={1.5} />
        </div>
        <span className="text-xs font-normal hidden sm:inline text-lilac-white/80">
          {currentConfig.label}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-midnight border border-dusk/30 rounded-card shadow-glow-lg z-50 overflow-hidden animate-fade-in-scale">
          <div className="p-3 border-b border-dusk/20">
            <p className="text-xs text-fog uppercase tracking-wider font-medium">Select Network</p>
          </div>
          <div className="p-2 space-y-1">
            {(Object.keys(NETWORK_CONFIG) as Network[]).map((net) => {
              const config = NETWORK_CONFIG[net];
              const isSelected = net === network;

              return (
                <button
                  key={net}
                  onClick={() => handleNetworkSelect(net)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-btn transition-all
                    ${isSelected
                      ? 'bg-deep-indigo/60 text-lilac-white border border-lavender/30'
                      : 'text-ash hover:text-lilac-white hover:bg-deep-indigo/40 border border-transparent'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-btn flex items-center justify-center border ${config.bgColor} ${isSelected ? config.borderColor : 'border-dusk/20'}`}>
                    <Globe className={`w-5 h-5 ${config.color}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs text-fog">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="w-4 h-4 text-lavender" />}
                    {net === 'mainnet' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-badge bg-red-950/60 text-red-400 font-medium border border-red-800/40">
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
            <div className="mx-3 mb-3 p-2.5 bg-red-950/40 border border-red-800/40 rounded-btn flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs text-red-300 leading-relaxed">
                You are connected to mainnet. Real transactions will occur.
              </p>
            </div>
          )}

          <div className="p-2 border-t border-dusk/20">
            <p className="text-xs text-steel text-center">
              Settings are saved locally
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function NetworkBadge() {
  const { network } = useNetwork();
  const config = NETWORK_CONFIG[network];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-badge ${config.bgColor} border ${config.borderColor}`}>
      <Globe className={`w-3 h-3 ${config.color}`} strokeWidth={1.5} />
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

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
