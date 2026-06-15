/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de docs/05-diseno-visual.md
        crema: '#FAF7F2',
        espresso: '#1A1614',
        cafe: '#6F4E37',
        latte: '#C8966B',
        caramelo: '#E07A3E',
        exito: '#2E9E5B',
        alerta: '#E0A52E',
        peligro: '#D14848',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
