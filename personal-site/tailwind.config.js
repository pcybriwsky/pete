/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        emoji: ["Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
        courier: ["Courier New", "Courier", "monospace"],
      },
      keyframes: {
        'gradient-dance': {
          '0%, 100%': {
            'background-position': '0% 50%',
            'background-size': '400% 400%'
          },
          '25%': {
            'background-position': '50% 25%',
            'background-size': '400% 400%'
          },
          '50%': {
            'background-position': '100% 50%',
            'background-size': '400% 400%'
          },
          '75%': {
            'background-position': '50% 75%',
            'background-size': '400% 400%'
          }
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% center' },
          '50%': { 'background-position': '100% center' }
        },
        'shake': {
        '0%, 100%': { transform: 'rotate(0deg)' },
        '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' }
        }
      },
      animation: {
        'gradient-dance': 'gradient-dance 12s ease infinite',
        'gradient-fast': 'gradient-shift 2s linear infinite',
        'shake': 'shake 0.5s ease-in-out'

      },
      backgroundImage: {
        'dancing-gradient': 'linear-gradient(45deg, #E6394644 0%, #fefefe33 33%, #fefefe33 66%, #F4A26144 100%)',
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
    colors: {
      primary: '#E63946',
      secondary: '#F4A261',
      accent: '#F4E1A1',
      background: '#FFFFFF',
      text: '#2A2A2A',
      alt: '#FDF8F2',
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      },
      coral: {
        light: '#F8AFA6',
        DEFAULT: '#E63946',
        dark: '#D63141'
      },
      sand: {
        light: '#F4E1A1',
        DEFAULT: '#F4A261',
        dark: '#E8915D'
      },
      cream: {
        light: '#FDF8F2',
        DEFAULT: '#F9EED7',
        dark: '#F4E1A1'
      }
    },
    screens: {
      'tinyMobile': '280px',
      // => @media (min-width: 280px) { ... }
      'mobile': '480px',
      // => @media (min-width: 480px) { ... }
      'tablet': '640px',
      // => @media (min-width: 640px) { ... }

      'laptop': '1024px',
      // => @media (min-width: 1024px) { ... }
      'desktop': '1280px',
      // => @media (min-width: 1280px) { ... }
      'larger-desktop': '1440px',
    },
  },
  plugins: [],
}

