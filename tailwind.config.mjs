/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0066ff',
        'primary-dark': '#58a6ff',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            a: {
              color: '#0066ff',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            code: {
              backgroundColor: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '4px',
              fontWeight: 'normal',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        dark: {
          css: {
            color: '#d0d0d0',
            a: {
              color: '#58a6ff',
            },
            strong: {
              color: '#f0f0f0',
            },
            h1: { color: '#f0f0f0' },
            h2: { color: '#f0f0f0' },
            h3: { color: '#f0f0f0' },
            h4: { color: '#f0f0f0' },
            code: {
              color: '#f0f0f0',
              backgroundColor: '#2a2a2a',
            },
            blockquote: {
              color: '#888',
              borderLeftColor: '#58a6ff',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
