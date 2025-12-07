import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark trading dashboard colors
        background: {
          DEFAULT: '#0a0e17',
          secondary: '#111827',
          tertiary: '#1a2332',
          elevated: '#1f2937',
        },
        surface: {
          DEFAULT: '#141c2b',
          hover: '#1a2536',
          active: '#212d42',
        },
        border: {
          DEFAULT: '#2a3549',
          subtle: '#1f2937',
          strong: '#374151',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#9ca3af',
          tertiary: '#6b7280',
          muted: '#4b5563',
        },
        accent: {
          blue: '#3b82f6',
          'blue-light': '#60a5fa',
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
        },
        gamma: {
          positive: '#10b981',
          'positive-light': '#34d399',
          'positive-bg': 'rgba(16, 185, 129, 0.1)',
          negative: '#ef4444',
          'negative-light': '#f87171',
          'negative-bg': 'rgba(239, 68, 68, 0.1)',
          neutral: '#f59e0b',
          'neutral-light': '#fbbf24',
        },
        chart: {
          grid: '#1f2937',
          axis: '#374151',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-positive': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-negative': '0 0 20px rgba(239, 68, 68, 0.15)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 
          'linear-gradient(to right, rgba(42, 53, 73, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 53, 73, 0.3) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '24px 24px',
      },
    },
  },
  plugins: [],
};

export default config;
