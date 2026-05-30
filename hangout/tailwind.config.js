const { hairlineWidth } = require('nativewind/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        bg2: '#0A0A0B',
        card: '#101114',
        card2: '#15171C',
        border: '#262A31',
        accent: '#00FF85',
        accent2: '#7CFF6B',
        blue: '#4DA3FF',
        text: '#F4F4F5',
        muted: '#A1A1AA',
        danger: '#FF6B4A',
        'danger-bg': '#2A1A16',
      },
      borderWidth: { hairline: hairlineWidth() },
    },
  },
};
