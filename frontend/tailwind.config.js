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
        'civic-dark': '#1A1A1A',
        'civic-card': '#FFFFFF',
        'civic-card-muted': '#F4F5F9',
        'civic-border': '#D8DAE5',
        'civic-border-subtle': '#E8EAF1',
        lime: {
          DEFAULT: '#9FFF00',
          hover: '#8EE600',
          light: '#E6FFB8',
          dark: '#73B800',
          tint: '#F4FFE0',
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
        'lime-glow': '0 0 24px -4px rgba(159, 255, 0, 0.45)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      borderRadius: {
        'civic': '14px',
      },
    },
  },
  plugins: [],
};
