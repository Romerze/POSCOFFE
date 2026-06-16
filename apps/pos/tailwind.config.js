/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Cereza de café": granate (marca) · miel (acento) · espresso · porcelana.
        paper: v('--paper'),
        surface: v('--surface'),
        surface2: v('--surface-2'),
        fg: v('--fg'),
        muted: v('--muted'),
        line: v('--line'),
        cherry: v('--cherry'),
        'cherry-ink': v('--cherry-ink'),
        honey: v('--honey'),
        pine: v('--pine'),
        danger: v('--danger'),
        // Barra de comando (oscura en ambos temas) — la firma.
        bar: v('--bar'),
        'bar-fg': v('--bar-fg'),
        'bar-muted': v('--bar-muted'),
        'bar-line': v('--bar-line'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { lg: '10px', xl: '14px', '2xl': '20px' },
      boxShadow: {
        soft: '0 1px 2px rgb(40 26 18 / 0.05), 0 6px 20px -10px rgb(40 26 18 / 0.18)',
        lift: '0 12px 40px -14px rgb(20 12 8 / 0.45)',
      },
    },
  },
  plugins: [],
};
