import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://jongmin.me',
  base: '/',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    // Astro 7 defaults to the Satteri processor; remark-math / rehype-katex are
    // unified plugins, so the unified processor stays opt-in here.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Rolldown requires a function here; object form is no longer accepted.
          manualChunks(id) {
            // Separate vendor chunks for better caching
            if (id.includes('node_modules/fuse.js')) return 'vendor-utils';
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