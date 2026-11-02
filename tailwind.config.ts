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
        olive: {
          50: '#F5F7F4',
          100: '#E8EDE6',
          200: '#D2DDD0',
          300: '#B5C4B2',
          400: '#8FA38B',
          500: '#5F755B',
          600: '#4C5F48',
          700: '#3C4B39',
          800: '#2D382B',
          900: '#1C241B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(201, 168, 76, 0.18)',
        'gold-lg': '0 10px 25px -3px rgba(201, 168, 76, 0.28), 0 0 15px rgba(201, 168, 76, 0.12)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 28px -5px rgba(0, 0, 0, 0.08), 0 8px 12px -6px rgba(0, 0, 0, 0.04)',
        'luxury': '0 20px 40px -15px rgba(44, 30, 20, 0.08), 0 0 1px 1px rgba(201, 168, 76, 0.15)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E0C87C 50%, #C9A84C 100%)',
        'gradient-gold-metallic': 'linear-gradient(135deg, #B8860B 0%, #F5DE88 28%, #FFF5CC 50%, #D4AF37 72%, #8C6414 100%)',
        'gradient-brown': 'linear-gradient(135deg, #6B4226 0%, #3C2415 100%)',
        'gradient-olive': 'linear-gradient(135deg, #3C4B39 0%, #222D21 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
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
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
