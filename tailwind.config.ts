import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Doppler Design System Tokens (from DESIGN.md)
        'midnight-plum': '#1c1624',
        'shadow-plum': '#2d2734',
        'bone-white': '#f1f0ec',
        'fog-line': '#e5e7eb',
        'ash-veil': '#d0c9c4',
        'mid-ash': '#a5a2a5',
        'iron-edge': '#55505b',
        'lavender-spark': '#b997ff',
        'signal-green': '#00f575',
        'neon-violet': '#6b13f5',
        'ember-orange': '#ff5632',
        'plasma-pink': '#ff9efa',

        // Semantic Aliases mapped to Doppler System
        void: {
          DEFAULT: '#1c1624',
          canvas: '#1c1624',
        },
        midnight: {
          DEFAULT: '#2d2734',
          surface: '#2d2734',
        },
        deep: {
          indigo: '#3a3340',
        },
        lilac: {
          white: '#f1f0ec',
          DEFAULT: '#f1f0ec',
        },
        ash: '#d0c9c4',
        fog: '#a5a2a5',
        steel: '#55505b',
        mercury: '#e5e7eb',
        dusk: '#55505b',
        lavender: {
          DEFAULT: '#b997ff',
          accent: '#b997ff',
        },
        iris: '#00f575', // Primary 'go' CTA action maps to signal green

        // Semantic surface & text aliases
        surface: {
          void: '#1c1624',
          card: '#2d2734',
          elevated: '#3a3340',
        },
        text: {
          primary: '#f1f0ec',
          secondary: '#d0c9c4',
          tertiary: '#a5a2a5',
          muted: '#55505b',
        },
        accent: {
          DEFAULT: '#b997ff',
          signal: '#00f575',
          iris: '#6b13f5',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        doppler: ["'Doppler Repro'", 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.03em',
      },
      borderRadius: {
        btn: '12px',
        card: '20px',
        badge: '9999px',
        nav: '9999px',
        '2xl': '20px',
        xl: '12px',
        lg: '8px',
      },
      boxShadow: {
        'glow-sm': '0 0 16px rgba(185, 151, 255, 0.04)',
        'glow-md': '0 0 24px rgba(185, 151, 255, 0.06)',
        'glow-lg': '0 0 32px rgba(185, 151, 255, 0.08)',
        'glow-violet': '0 0 60px rgba(185, 151, 255, 0.15)',
        'glow-green': '0 0 24px rgba(0, 245, 117, 0.35)',
        'screenshot-frame': '0 0 60px rgba(185, 151, 255, 0.15)',
      },
      backgroundImage: {
        'doppler-gradient': 'linear-gradient(91deg, #855aff 14.92%, #ff5632 90.53%)',
        'cosmic-gradient': 'linear-gradient(91deg, #855aff 14.92%, #ff5632 90.53%)',
        'aurora-gradient': 'radial-gradient(ellipse at top, rgba(107, 19, 245, 0.35) 0%, rgba(255, 158, 250, 0.15) 35%, transparent 70%)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        auroraBreath: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.65' },
          '50%': { transform: 'scale(1.1) rotate(3deg)', opacity: '0.9' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'aurora-breath': 'auroraBreath 8s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'ping-slow': 'pingSlow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
