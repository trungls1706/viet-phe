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
        brown: {
          50: 'var(--brown-50)',
          100: 'var(--brown-100)',
          200: 'var(--brown-200)',
          300: 'var(--brown-300)',
          400: 'var(--brown-400)',
          500: 'var(--brown-500)',
          600: 'var(--brown-600)',
          700: 'var(--brown-700)',
          800: 'var(--brown-800)',
          900: 'var(--brown-900)',
        },
      },
      fontFamily: {
        'indie-flower': ['var(--font-indie-flower)'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
