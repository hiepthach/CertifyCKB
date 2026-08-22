'use client';

import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <Loader2 className={clsx(sizeStyles[size], 'animate-spin text-lavender')} />
      {label && <span className="text-fog text-sm">{label}</span>}
    </div>
  );
}
