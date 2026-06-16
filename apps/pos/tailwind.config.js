/** @type {import('tailwindcss').Config} */
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad POSCOFFE — tinta de tostaduría + matcha + crema ámbar.
        // Valores temáticos (claro/oscuro) vía variables CSS en index.css.
        bg: withVar('--bg'),
        surface: withVar('--surface'),
        surface2: withVar('--surface-2'),
        fg: withVar('--fg'),
        muted: withVar('--muted'),
        line: withVar('--line'),
        brand: withVar('--brand'),
        'brand-ink': withVar('--brand-ink'),
        accent: withVar('--accent'),
        exito: withVar('--exito'),
        alerta: withVar('--alerta'),
        peligro: withVar('--peligro'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -8px rgb(0 0 0 / 0.12)',
        lift: '0 8px 32px -12px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
};
