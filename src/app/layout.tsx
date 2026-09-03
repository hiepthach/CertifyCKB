import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Credora — Verifiable Credentials on CKB',
  description: 'Issue, manage, and verify verifiable credentials on Nervos CKB using Spore Protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-midnight-plum text-bone-white antialiased selection:bg-lavender-spark/30 selection:text-bone-white">
        <Providers>
          <Header />
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
