import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://jongmin.me',
  base: '/',
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false, // We handle base styles in globals.css
      }
    }),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'vendor-utils': ['fuse.js'],
          },
        },
      },
      minify: 'esbuild',
      cssMinify: true,
    },
    ssr: {
      noExternal: ['katex'],
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  output: 'static',
  compressHTML: true,
});