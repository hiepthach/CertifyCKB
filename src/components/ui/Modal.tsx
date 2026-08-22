'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight-plum/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Surface — Doppler elevated panel */}
      <div
        className={twMerge(
          clsx(
            'relative bg-deep-indigo bg-[#3a3340] border border-fog-line/20 border-dusk/30 rounded-card shadow-screenshot-frame',
            'w-full mx-auto animate-fade-in-scale z-10 overflow-hidden',
            sizeStyles[size]
          )
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-fog-line/10 border-dusk/20">
            <h2 className="text-base font-semibold text-bone-white text-lilac-white tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-ash-veil hover:text-bone-white transition-colors rounded-btn hover:bg-shadow-plum/60"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-fog-line/10 border-dusk/20 flex justify-end gap-3 bg-shadow-plum/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

