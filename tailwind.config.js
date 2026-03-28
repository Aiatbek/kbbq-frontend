/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Core surfaces — warm dark charcoal, not cold navy
          bg:       '#1A1008',   // deep smoky charcoal
          surface:  '#221508',   // slightly warmer surface
          elevated: '#2E1E0E',   // raised cards / modals
          border:   '#3D2910',   // warm amber-tinted border
          // Accent — fire orange
          accent:   '#E8640C',   // flame orange
          accentDk: '#C4500A',   // darker hover
          accentLt: '#F59044',   // lighter glow
          // Text
          primary:  '#F5E6D0',   // warm cream
          muted:    '#9C7A56',   // warm tan
          faint:    '#5C3D1E',   // dim hint
          // Semantics
          danger:   '#F87171',
          success:  '#4ADE80',
          warning:  '#FBBF24',
          // Extras
          ember:    '#FF4500',   // hot ember red-orange
          smoke:    '#3D2910',   // smoke gray-brown
          gold:     '#D4A017',   // golden highlight
        },
      },
      fontFamily: {
      display: ['Cormorant Garamond', 'serif'],
      sans: ['Jost', 'sans-serif'],
    },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #E8640C 0%, #FF4500 50%, #C4500A 100%)',
      },
    },
  },
  plugins: [],
}
