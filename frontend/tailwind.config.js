/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#F2F6F0',
          100: '#E1EBD9',
          200: '#C3D6BA',
          300: '#A0BC94',
          400: '#7D9B76',
          500: '#5E7D58',
          600: '#4A6445',
          700: '#384D34',
          800: '#263523',
          900: '#151E13',
        },
        earth: {
          50:  '#FAF6F0',
          100: '#F0E8D8',
          200: '#DDD0B8',
          300: '#C4B090',
          400: '#A8906A',
          500: '#8C7254',
          600: '#705A40',
          700: '#54432F',
          800: '#382D1F',
          900: '#1C160F',
        },
        linen: {
          DEFAULT: '#F5F0E8',
          dark:    '#EDE8DC',
        },
        forest: {
          DEFAULT: '#1A1F1C',
          surface: '#242B26',
          raised:  '#2D362F',
        },
        ink: {
          DEFAULT: '#2C3329',
          muted:   '#6B7A65',
          ghost:   '#A3AFA0',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        md: '10px',
        lg: '16px',
      },
    },
  },
  plugins: [],
}
