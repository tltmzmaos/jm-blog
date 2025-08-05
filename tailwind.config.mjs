/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // 현대적인 다크 테마 색상 (GitHub/Discord 스타일)
        dark: {
          bg: '#0d1117',        // 메인 배경 (GitHub 다크)
          surface: '#161b22',   // 카드/컨테이너 배경
          border: '#30363d',    // 테두리
          muted: '#21262d',     // 약간 밝은 배경
          text: '#f0f6fc',      // 주요 텍스트 (높은 대비)
          subtext: '#8b949e',   // 보조 텍스트 (중간 대비)
          accent: '#58a6ff',    // 액센트 색상 (링크, 버튼)
          accentHover: '#79c0ff', // 액센트 호버
          success: '#3fb950',   // 성공 색상
          warning: '#d29922',   // 경고 색상
          danger: '#f85149',    // 위험 색상
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            '[class~="lead"]': {
              color: '#4b5563',
            },
            a: {
              color: '#3b82f6',
              textDecoration: 'none',
              '&:hover': {
                color: '#2563eb',
              },
            },
            strong: {
              color: '#111827',
            },
            'ol > li::before': {
              color: '#6b7280',
            },
            'ul > li::before': {
              backgroundColor: '#d1d5db',
            },
            hr: {
              borderColor: '#e5e7eb',
            },
            blockquote: {
              color: '#4b5563',
              borderLeftColor: '#e5e7eb',
            },
            h1: {
              color: '#111827',
            },
            h2: {
              color: '#111827',
            },
            h3: {
              color: '#111827',
            },
            h4: {
              color: '#111827',
            },
            'figure figcaption': {
              color: '#6b7280',
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
            },
          },
        },
        dark: {
          css: {
            color: '#f0f6fc',
            '[class~="lead"]': {
              color: '#8b949e',
            },
            a: {
              color: '#58a6ff',
              '&:hover': {
                color: '#79c0ff',
              },
            },
            strong: {
              color: '#f0f6fc',
            },
            'ol > li::before': {
              color: '#8b949e',
            },
            'ul > li::before': {
              backgroundColor: '#8b949e',
            },
            hr: {
              borderColor: '#30363d',
            },
            blockquote: {
              color: '#8b949e',
              borderLeftColor: '#30363d',
            },
            h1: {
              color: '#f0f6fc',
            },
            h2: {
              color: '#f0f6fc',
            },
            h3: {
              color: '#f0f6fc',
            },
            h4: {
              color: '#f0f6fc',
            },
            'figure figcaption': {
              color: '#8b949e',
            },
            code: {
              color: '#f0f6fc',
              backgroundColor: '#21262d',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#161b22',
              color: '#f0f6fc',
              border: '1px solid #30363d',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              borderRadius: '0',
              fontWeight: 'normal',
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