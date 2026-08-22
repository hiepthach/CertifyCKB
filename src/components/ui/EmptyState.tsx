'use client';

import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-lg mx-auto">
      {icon && (
        <div className="w-16 h-16 mb-5 bg-shadow-plum border border-fog-line/15 rounded-2xl flex items-center justify-center text-3xl shadow-glow-violet/30 animate-float">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-bone-white mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-ash-veil text-sm mb-6 max-w-md leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

