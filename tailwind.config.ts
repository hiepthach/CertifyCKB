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
        // Reflect Notes Design System
        void: {
          DEFAULT: '#030014',
          canvas: '#030014',
        },
        midnight: {
          DEFAULT: '#060317',
          surface: '#060317',
        },
        deep: {
          indigo: '#10093a',
        },
        lilac: {
          white: '#f4f0ff',
          DEFAULT: '#f4f0ff',
        },
        ash: '#a8a6b7',
        fog: '#918ea0',
        steel: '#54525f',
        mercury: '#cdccd0',
        dusk: '#72707b',
        lavender: {
          DEFAULT: '#9382ff',
          accent: '#9382ff',
        },
        iris: '#5046e4',

        // Semantic aliases
        surface: {
          void: '#030014',
          card: '#060317',
          elevated: '#10093a',
        },
        text: {
          primary: '#f4f0ff',
          secondary: '#a8a6b7',
          tertiary: '#918ea0',
          muted: '#54525f',
        },
        accent: {
          DEFAULT: '#9382ff',
          iris: '#5046e4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['AeonikPro', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        btn: '5px',
        card: '16px',
        badge: '32px',
        nav: '999px',
      },
      boxShadow: {
        'glow-sm': 'inset 0 0 16px rgba(255, 255, 255, 0.04)',
        'glow-md': 'inset 0 0 24px rgba(255, 255, 255, 0.05)',
        'glow-lg': 'inset 0 0 32px rgba(255, 255, 255, 0.06)',
        'glow-violet': 'inset 0 -7px 11px rgba(164, 143, 255, 0.12)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(90.01deg, #e59cff 0.01%, #ba9cff 50.01%, #9cb2ff 100%)',
        'aurora-gradient': 'linear-gradient(180deg, rgba(183,164,251,0) 0%, #b7a4fb 50%, #8562ff 100%, rgba(133,98,255,0) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
