import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EC',
          100: '#F5EDD3',
          200: '#EBDBA8',
          300: '#E0C87C',
          400: '#D4B45E',
          500: '#C9A84C',
          600: '#A68A3E',
          700: '#836C31',
          800: '#5F4E23',
          900: '#3C3016',
        },
        brown: {
          50: '#F5F0EB',
          100: '#E8DFD3',
          200: '#D1BFA7',
          300: '#BA9F7B',
          400: '#9E7E56',
          500: '#6B4226',
          600: '#5A3720',
          700: '#482C1A',
          800: '#3C2415',
          900: '#2A1A0E',
        },
        beige: {
          50: '#FFFDF8',
          100: '#FFF9EF',
          200: '#FAF7F2',
          300: '#F5F0E8',
          400: '#EDE5D8',
          500: '#E8DFD0',
          600: '#D4C8B5',
          700: '#B8A890',
          800: '#9C8A6E',
          900: '#7D6D56',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(201, 168, 76, 0.15)',
        'gold-lg': '0 10px 25px -3px rgba(201, 168, 76, 0.2)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E0C87C 50%, #C9A84C 100%)',
        'gradient-brown': 'linear-gradient(135deg, #6B4226 0%, #3C2415 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
