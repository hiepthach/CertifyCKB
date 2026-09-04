'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui';
import { CredoraLogo } from '@/components/ui/CredoraLogo';
import { Wallet, LogOut, Menu, X, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { NetworkSelector } from './wallet/NetworkSelector';

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const pathname = usePathname();
  const { open, disconnect, address, isConnected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/clusters', label: 'Institutions' },
    { href: '/certificates/issue', label: 'Issue Certificates' },
    { href: '/certificates', label: 'My Certificates' },
    { href: '/verify', label: 'Verify' },
  ];

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerLink = () => {
    const explorers: Record<string, string | null> = {
      testnet: 'https://testnet.explorer.nervos.org',
      mainnet: 'https://explorer.nervos.org',
    };
    return explorers[process.env.NEXT_PUBLIC_NETWORK || 'testnet'] || null;
  };

  const explorerUrl = getExplorerLink();

  return (
    <div className="sticky top-0 z-40 w-full pt-3 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Doppler Glass Header Nav — midnight plum with frosted blur & hairline border */}
        <header className="relative bg-midnight-plum/85 backdrop-blur-xl border border-fog-line/10 rounded-2xl shadow-glow-sm flex items-center justify-between px-4 sm:px-6 py-1.5 sm:py-2 transition-all duration-300">
          {/* Left: Credora Logo Lockup */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <CredoraLogo size={40} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(185,151,255,0.4)]" />
              <span className="text-lg font-bold text-bone-white tracking-tight">
                Credora
              </span>
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 text-sm rounded-xl font-medium transition-all duration-200 ${isActive
                        ? 'text-bone-white bg-shadow-plum border border-fog-line/15 shadow-sm'
                        : 'text-ash-veil hover:text-bone-white hover:bg-shadow-plum/50'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Network Selector + Wallet Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network Selector */}
            <NetworkSelector />

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Address with copy feedback */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 px-3 py-1.5 bg-shadow-plum rounded-xl border border-fog-line/15 hover:border-lavender-spark/40 transition-all duration-200 group"
                    title="Copy address"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
                    <span className="text-xs font-mono text-bone-white">
                      {truncateAddress(address || '')}
                    </span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-signal-green animate-fade-in" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-mid-ash group-hover:text-bone-white transition-colors" />
                    )}
                  </button>

                  {/* Explorer link */}
                  {explorerUrl && (
                    <a
                      href={`${explorerUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-shadow-plum rounded-xl border border-fog-line/15 hover:border-lavender-spark/40 transition-colors text-mid-ash hover:text-bone-white"
                      title="View on CKB Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Disconnect button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="gap-1.5 border border-fog-line/15"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button onClick={open} size="sm" className="gap-1.5 shadow-glow-green/30">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Connect</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-ash-veil hover:text-bone-white transition-colors rounded-xl hover:bg-shadow-plum"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav className="absolute top-full left-0 right-0 mt-2 bg-shadow-plum border border-fog-line/15 rounded-2xl shadow-screenshot-frame p-3 flex flex-col gap-1.5 md:hidden animate-fade-in-scale z-50">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3.5 py-2.5 text-sm rounded-xl transition-colors font-medium ${isActive
                        ? 'text-bone-white bg-midnight-plum border border-fog-line/15'
                        : 'text-ash-veil hover:text-bone-white hover:bg-midnight-plum/50'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </header>
      </div>
    </div>
  );
}

