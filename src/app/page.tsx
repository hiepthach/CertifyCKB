import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import { Wallet, Shield, Award, Users, FileText, Zap } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Wallet Integration',
    description: 'Connect with JoyID, MetaMask, or other OmniLock-compatible wallets',
  },
  {
    icon: Shield,
    title: 'Verifiable Credentials',
    description: 'Issue W3C-compliant verifiable credentials stored on CKB',
  },
  {
    icon: Award,
    title: 'Certificate Issuance',
    description: 'Create and manage course completion certificates as Spore DOBs',
  },
  {
    icon: Users,
    title: 'Provider Management',
    description: 'Register course providers as Spore Clusters',
  },
  {
    icon: FileText,
    title: 'Templates',
    description: 'Design custom certificate templates with visual branding',
  },
  {
    icon: Zap,
    title: 'Batch Issuance',
    description: 'Issue multiple certificates at once from CSV or JSON',
  },
];

export default function Home() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="relative text-center mb-16">
        <Badge variant="info" className="mb-4">
          Built on Nervos CKB • Powered by Spore Protocol
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          CKB Credential Registry
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
          Issue, manage, and verify verifiable credentials on the Nervos CKB blockchain.
          Transform course completions into portable, tamper-proof certificates.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/clusters">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/verify">
            <Button variant="secondary" size="lg">Verify Certificate</Button>
          </Link>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Core Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} variant="default" padding="lg">
              <feature.icon className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Architecture
        </h2>
        <Card variant="highlighted" padding="lg" className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Wallet</h4>
              <p className="text-sm text-slate-400">OmniLock</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Cluster</h4>
              <p className="text-sm text-slate-400">Provider Identity</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Certificate</h4>
              <p className="text-sm text-slate-400">Spore DOB</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Verify</h4>
              <p className="text-sm text-slate-400">On-chain</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          CKB Credential Registry • Built with Spore Protocol
        </p>
      </footer>
    </div>
  );
}
