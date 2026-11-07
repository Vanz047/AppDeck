/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07070c',
        panel: '#0e0e16',
        'panel-2': '#13131c',
        'panel-3': '#1a1a25',
        border: '#1f1f2e',
        'border-2': '#2a2a3a',
        text: '#e8e8f0',
        muted: '#6a6a82',
        'muted-2': '#4a4a5e',
        accent: '#7c3aed',
        'accent-2': '#a78bfa',
        cyan: '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        frame: '32px',
      },
    },
  },
  plugins: [],
}
