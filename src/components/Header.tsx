'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCKBConnector } from '@ckb-ccc/connector-react';
import { Button, Badge } from '@/components/ui';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NETWORK_DISPLAY_NAMES } from '@/lib/ckb/config';
import { useNetwork } from '@/hooks';

export function Header() {
  const pathname = usePathname();
  const { address, disconnect } = useCKBConnector();
  const { network, isDevnet } = useNetwork();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/clusters', label: 'Clusters' },
    { href: '/certificates', label: 'My Certificates' },
    { href: '/verify', label: 'Verify' },
  ];

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
          <div className="flex items-center gap-4">
            {/* Network Badge */}
            <Badge variant={isDevnet ? 'warning' : 'success'}>
              {NETWORK_DISPLAY_NAMES[network]}
            </Badge>

            {/* Wallet */}
            {address ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-sm font-mono text-white">
                    {truncateAddress(address)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={disconnect}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <WalletConnectButton />
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

function WalletConnectButton() {
  const { connect } = useCKBConnector();

  return (
    <Button onClick={connect} size="sm">
      <Wallet className="w-4 h-4" />
      Connect
    </Button>
  );
}

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
