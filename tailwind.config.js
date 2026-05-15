/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './pages/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        jetbrains: ['JetBrainsMono_400Regular', 'monospace'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
      },
    },
  },
  plugins: [],
};
