import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://jongminlee.dev',
  base: '/',
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false, // We handle base styles in globals.css
      }
    }),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
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