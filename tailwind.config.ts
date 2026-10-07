import type { Config } from 'tailwindcss';

/**
 * Orionis Design System.
 * Colours, typography and elevation tokens derived from the official
 * brand guidelines (#134675 / #4CC9F0 / #F4C430) and the visual language
 * of the existing API Reference (dark code surfaces, Titillium Web).
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#0B2A48',
          navy: '#134675',
          blue: '#1B5C97',
          steel: '#3E7CB1',
          cyan: 'var(--brand-cyan)',
          cyanSoft: 'var(--brand-cyan-soft)',
          gold: 'var(--brand-gold)',
          goldSoft: 'var(--brand-gold-soft)',
          mist: '#EEF4FA',
        },
        ink: {
          50: 'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          950: '#060B15',
        },
        surface: {
          page: 'rgb(var(--surface-page) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          section: 'rgb(var(--surface-section) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        // Tokens inherited from the Orionis API Reference (dark code surfaces).
        api: {
          bg: 'var(--api-bg)',
          surface: 'var(--api-surface)',
          text: 'var(--api-text)',
          muted: 'var(--api-muted)',
          primary: 'var(--api-primary)',
          accent: 'var(--api-accent)',
          border: 'var(--api-border)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Titillium Web', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '5xl': ['3rem', { lineHeight: '1.05', letterSpacing: '0' }],
        '6xl': ['3.75rem', { lineHeight: '1.02', letterSpacing: '0' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '0' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 42, 72, 0.06), 0 6px 18px rgba(11, 42, 72, 0.06)',
        card: '0 4px 16px rgba(11, 42, 72, 0.10)',
        elevated: '0 24px 60px -20px rgba(11, 42, 72, 0.35)',
        ring: '0 0 0 1px rgba(19, 70, 117, 0.08)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(60% 60% at 50% 0%, rgba(76, 201, 240, 0.22) 0%, rgba(11, 42, 72, 0) 70%)',
        'brand-gradient':
          'linear-gradient(120deg, #134675 0%, #1B5C97 45%, var(--brand-cyan) 100%)',
        'gold-gradient':
          'linear-gradient(120deg, var(--brand-gold) 0%, var(--brand-gold-soft) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
