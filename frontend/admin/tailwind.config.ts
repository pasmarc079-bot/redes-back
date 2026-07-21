/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D48B',
          dark: '#B8860B',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          lighter: '#3D3D3D',
        },
        cream: '#F5F3F0',
        silver: '#E0E0E0',
        hope: '#4A7C59',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
