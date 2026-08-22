'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCcc } from '@ckb-ccc/connector-react';
import { Button } from '@/components/ui';
import { Wallet, LogOut, Menu, X, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { NetworkSelector } from './wallet/NetworkSelector';

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const pathname = usePathname();
  const { open, disconnect, signerInfo } = useCcc();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const address = signerInfo?.address?.addressStr;
  const isConnected = !!address;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/clusters', label: 'Clusters' },
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
      testnet: 'https://explorer.nervos.org/aggron2',
      mainnet: 'https://explorer.nervos.org',
    };
    return explorers[process.env.NEXT_PUBLIC_NETWORK || 'testnet'] || null;
  };

  const explorerUrl = getExplorerLink();

  return (
    <div className="sticky top-0 z-40 w-full pt-4 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Floating nav pill — midnight surface with inset rim-light glow */}
        <header className="relative bg-midnight border border-dusk/20 rounded-nav shadow-glow-md flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-deep-indigo rounded-btn flex items-center justify-center border border-lavender/30 shadow-glow-violet">
                <span className="text-lavender font-semibold text-xs">CK</span>
              </div>
              <span className="font-display text-sm font-medium text-lilac-white hidden sm:block tracking-wide">
                Credential Registry
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-normal rounded-btn transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-lilac-white bg-deep-indigo/60'
                      : 'text-fog hover:text-lilac-white hover:bg-deep-indigo/30'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Network Selector */}
            <NetworkSelector />

            {/* Wallet Connection Status */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Address with copy button */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 px-3 py-1 bg-deep-indigo rounded-btn border border-dusk/30 hover:border-lavender/40 transition-colors group"
                    title="Copy address"
                  >
                    <span className="text-xs font-mono text-lilac-white">
                      {truncateAddress(address)}
                    </span>
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-steel group-hover:text-fog transition-colors" />
                    )}
                  </button>

                  {/* Explorer link */}
                  {explorerUrl && (
                    <a
                      href={`${explorerUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-deep-indigo rounded-btn border border-dusk/30 hover:border-lavender/40 transition-colors text-steel hover:text-fog"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Disconnect button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="gap-1 border border-dusk/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button onClick={open} size="sm" className="gap-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs">Connect</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-fog hover:text-lilac-white transition-colors rounded-btn hover:bg-deep-indigo"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="absolute top-full left-0 right-0 mt-2 mx-2 bg-midnight border border-dusk/20 rounded-card shadow-glow-lg p-3 flex flex-col gap-1 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-sm rounded-btn transition-colors ${
                    pathname === item.href
                      ? 'text-lilac-white bg-deep-indigo/60'
                      : 'text-fog hover:text-lilac-white hover:bg-deep-indigo/30'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </header>
      </div>
    </div>
  );
}
