/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#EDEEF5',
        'canvas-dark': '#0B0D13',
        'surface-dark': '#131722',
        'surface-dark-elevated': '#1C2234',
        'civic-dark': '#1A1A1A',
        'civic-card': '#FFFFFF',
        'civic-card-muted': '#F4F5F9',
        'civic-border': '#D8DAE5',
        'civic-border-subtle': '#E8EAF1',
        'civic-border-dark': 'rgba(255, 255, 255, 0.1)',
        'civic-border-dark-glow': 'rgba(159, 255, 0, 0.3)',
        lime: {
          DEFAULT: '#9FFF00',
          hover: '#8EE600',
          light: '#E6FFB8',
          dark: '#73B800',
          tint: '#F4FFE0',
          glow: 'rgba(159, 255, 0, 0.35)',
        },
        cyan: {
          DEFAULT: '#00F0FF',
          hover: '#00D8E6',
          light: '#CCFCFF',
          dark: '#00A3AD',
          glow: 'rgba(0, 240, 255, 0.35)',
        },
        risk: {
          critical: '#DC2626',
          'critical-bg': '#FEF2F2',
          'critical-border': '#FECACA',
          high: '#EA580C',
          'high-bg': '#FFF7ED',
          'high-border': '#FFEDD5',
          medium: '#D97706',
          'medium-bg': '#FFFBEB',
          'medium-border': '#FEF3C7',
          low: '#059669',
          'low-bg': '#ECFDF5',
          'low-border': '#A7F3D0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(26, 26, 26, 0.04), 0 1px 2px 0 rgba(26, 26, 26, 0.02)',
        'card': '0 4px 20px -2px rgba(26, 26, 26, 0.05), 0 2px 6px -1px rgba(26, 26, 26, 0.03)',
        'elevated': '0 12px 32px -4px rgba(26, 26, 26, 0.08), 0 4px 12px -2px rgba(26, 26, 26, 0.04)',
        'dark-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'lime-glow': '0 0 24px -2px rgba(159, 255, 0, 0.45)',
        'cyan-glow': '0 0 24px -2px rgba(0, 240, 255, 0.45)',
        'neon-badge': '0 0 12px rgba(159, 255, 0, 0.25)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      borderRadius: {
        'civic': '14px',
        'civic-lg': '20px',
        'civic-xl': '28px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-spin': 'glow-spin 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
