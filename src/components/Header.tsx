'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCcc } from '@ckb-ccc/connector-react';
import { Button } from '@/components/ui';
import { Wallet, LogOut, Menu, X, ExternalLink, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Get network-specific explorer URL
  const getExplorerLink = () => {
    const explorers: Record<string, string | null> = {
      testnet: 'https://explorer.nervos.org/aggron2',
      mainnet: 'https://explorer.nervos.org',
    };
    return explorers[process.env.NEXT_PUBLIC_NETWORK || 'testnet'] || null;
  };

  const explorerUrl = getExplorerLink();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CK</span>
              </div>
              <span className="font-semibold text-white hidden sm:block">Credential Registry</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network Selector */}
            <NetworkSelector />

            {/* Wallet Connection Status */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Address with copy button */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors group"
                    title="Copy address"
                  >
                    <span className="text-sm font-mono text-white">
                      {truncateAddress(address)}
                    </span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                    )}
                  </button>

                  {/* Explorer link */}
                  {explorerUrl && (
                    <a
                      href={`${explorerUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors text-slate-500 hover:text-slate-300"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Mobile address */}
                <div className="sm:hidden px-2 py-1 bg-slate-800 rounded border border-slate-700">
                  <span className="text-xs font-mono text-white">
                    {truncateAddress(address)}
                  </span>
                </div>

                {/* Disconnect button */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={disconnect}
                  className="gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button onClick={open} size="sm" className="gap-1">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Connection Status Bar */}
        {isConnected && (
          <div className="hidden md:flex items-center gap-4 py-2 px-1 border-t border-slate-800/50 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-medium">Connected</span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="text-slate-400">
              Address: <span className="font-mono text-slate-300">{truncateAddress(address)}</span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="text-slate-400">
              Network: <span className="text-slate-300 capitalize">{process.env.NEXT_PUBLIC_NETWORK || 'testnet'}</span>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 text-sm font-medium ${
                  pathname === item.href ? 'text-blue-400' : 'text-slate-400'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
