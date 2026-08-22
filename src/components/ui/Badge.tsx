'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'lavender' | 'success' | 'warning' | 'danger' | 'neutral';
}

const variantStyles = {
  default:
    'bg-midnight text-lilac-white border border-dusk/30 shadow-glow-sm',
  lavender:
    'bg-deep-indigo text-lavender border border-iris/40 shadow-glow-violet',
  success:
    'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
  warning:
    'bg-amber-950/60 text-amber-400 border border-amber-800/40',
  danger:
    'bg-red-950/60 text-red-400 border border-red-800/40',
  neutral:
    'bg-midnight text-ash border border-dusk/30',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium',
            variantStyles[variant],
            className
          )
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
