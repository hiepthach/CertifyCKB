'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlighted' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  default:
    'bg-midnight border border-dusk shadow-glow-sm',
  highlighted:
    'bg-midnight border border-lavender shadow-glow-md',
  interactive:
    'bg-midnight border border-dusk shadow-glow-sm hover:border-dusk hover:shadow-glow-violet hover:-translate-y-0.5 cursor-pointer transition-all duration-300 ease-out',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-card relative overflow-hidden',
            variantStyles[variant],
            paddingStyles[padding],
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';


