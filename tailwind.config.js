/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0A0A08',
        surface: '#141412',
        card:    '#1C1C18',
        border:  '#2A2A25',
        accent:  '#D4FF3A',
        muted:   '#6B6B65',
        ink:     '#F5F4EE',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
