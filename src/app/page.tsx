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

const architectureSteps = [
  { icon: Wallet, label: 'Wallet', sublabel: 'OmniLock', color: 'lavender' },
  { icon: Users, label: 'Cluster', sublabel: 'Provider Identity', color: 'cosmic' },
  { icon: Award, label: 'Certificate', sublabel: 'Spore DOB', color: 'success' },
  { icon: Shield, label: 'Verify', sublabel: 'On-chain', color: 'warning' },
];

export default function Home() {
  return (
    <div className="py-12 space-y-24">
      {/* Hero Section */}
      <section className="relative text-center star-field rounded-card p-12">
        {/* Decorative gradient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-card">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-lavender/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-iris/10 rounded-full blur-[60px]" />
        </div>

        {/* AI-style badge */}
        <Badge variant="lavender" className="mb-6 inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" fill="currentColor"/>
          </svg>
          Built on Nervos CKB
        </Badge>

        {/* Main headline */}
        <h1 className="font-display text-5xl md:text-6xl font-medium text-lilac-white mb-4 leading-tight tracking-tight">
          CKB Credential Registry
        </h1>

        {/* Gradient accent on key word */}
        <p className="text-xl text-ash mb-10 max-w-2xl mx-auto leading-relaxed">
          Issue, manage, and verify verifiable credentials on the{' '}
          <span className="cosmic-text font-medium">Nervos CKB blockchain</span>.
          Transform course completions into portable, tamper-proof certificates.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/clusters">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/verify">
            <Button variant="secondary" size="lg">Verify Certificate</Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-lilac-white mb-3">
            Core Features
          </h2>
          <p className="text-ash text-base">Everything you need to manage verifiable credentials</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Card variant="default" padding="lg" className="group">
                {/* Outlined icon — stroke-based, 1.5px, #f4f0ff */}
                <div className="w-10 h-10 flex items-center justify-center mb-4 rounded-btn border border-dusk/40 group-hover:border-lavender/50 transition-colors duration-200">
                  <feature.icon className="w-5 h-5 text-lilac-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-lilac-white mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-ash leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Overview */}
      <section>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-lilac-white mb-3">
            Architecture
          </h2>
          <p className="text-ash text-base">How the credential registry works</p>
        </div>

        <Card variant="highlighted" padding="lg" className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {architectureSteps.map((step, i) => (
              <div key={step.label} className="relative">
                {/* Connector line */}
                {i < architectureSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-gradient-to-r from-lavender/40 to-transparent" />
                )}

                <div className="w-12 h-12 bg-deep-indigo rounded-btn border border-lavender/30 flex items-center justify-center mx-auto mb-3 shadow-glow-violet">
                  <step.icon className="w-5 h-5 text-lavender" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-medium text-lilac-white mb-0.5">{step.label}</h4>
                <p className="text-xs text-fog">{step.sublabel}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="aurora-divider mb-8" />
        <p className="text-center text-fog text-sm">
          CKB Credential Registry — Built with{' '}
          <span className="text-lavender">Spore Protocol</span>
        </p>
      </footer>
    </div>
  );
}
