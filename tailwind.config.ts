import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        text: 'var(--text)',
        'text-h': 'var(--text-h)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
        'danger-border': 'var(--danger-border)',
        warn: 'var(--warn)',
        'warn-bg': 'var(--warn-bg)',
        'warn-border': 'var(--warn-border)',
      },
      fontFamily: {
        sans: 'var(--sans)',
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
      },
    },
  },
} satisfies Config
