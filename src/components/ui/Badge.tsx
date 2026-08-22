'use client';

import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'lavender' | 'default';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-midnight text-ash border-dusk',
  neutral: 'bg-midnight text-ash border-dusk',
  success: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  warning: 'bg-amber-950 text-amber-400 border-amber-800',
  danger: 'bg-red-950 text-red-400 border-red-800',
  lavender: 'bg-deep-indigo text-lavender border-iris shadow-glow-violet',
};

const pulseColors: Record<BadgeVariant, string> = {
  default: 'bg-ash',
  neutral: 'bg-ash',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  lavender: 'bg-lavender',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', pulse = false, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-badge text-xs font-medium tracking-wide transition-all duration-200 border',
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className={clsx('animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75', pulseColors[variant])} />
            <span className={clsx('relative inline-flex rounded-full h-2 w-2', pulseColors[variant])} />
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

