import type { Metadata } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Credora — Verifiable Credentials on CKB',
  description: 'Issue, manage, and verify verifiable credentials on Nervos CKB using Spore Protocol',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Credora — Verifiable Credentials on CKB',
    description: 'Issue, manage, and verify verifiable credentials on Nervos CKB using Spore Protocol',
    siteName: 'Credora',
    images: [{ url: '/icon.svg' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
