import React from 'react';

interface CredoraLogoProps {
  size?: number;
  className?: string;
}

export function CredoraLogo({ size = 24, className = '' }: CredoraLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="credora_c_grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.4" stopColor="#D2B5FF" />
          <stop offset="1" stopColor="#8A4FFF" />
        </linearGradient>
        <linearGradient id="credora_core_grad" x1="38" y1="24" x2="54" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#B997FF" />
          <stop offset="1" stopColor="#7036D9" />
        </linearGradient>
      </defs>
      {/* Outer sweeping C ribbon with depth */}
      <path
        d="M46 20C42 15 35 13 28 15C18 18 15 28 17 38C19 46 28 50 36 48C43 46 47 41 49 36"
        stroke="url(#credora_c_grad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner accent ribbon segment for layered depth */}
      <path
        d="M26 23C23 25 22 30 23 34C24 38 28 41 33 40C37 39 39 36 40 33"
        stroke="rgba(185,151,255,0.6)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Radiant Proof Spark Core */}
      <path
        d="M42 24L44.5 30L51 32L44.5 34L42 40L39.5 34L33 32L39.5 30L42 24Z"
        fill="url(#credora_core_grad)"
      />
      <circle cx="42" cy="32" r="1.8" fill="#FFFFFF" />
    </svg>
  );
}

export default CredoraLogo;
