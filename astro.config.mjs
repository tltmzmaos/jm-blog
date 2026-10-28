import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeImageAttrs from './src/plugins/rehype-image-attrs.mjs';
import rehypeTableWrap from './src/plugins/rehype-table-wrap.mjs';

export default defineConfig({
  site: 'https://jongmin.me',
  base: '/',
  // Pages are built as folders (/posts/x/index.html), and GitHub Pages
  // redirects /posts/x to /posts/x/. Links with the slash skip that hop,
  // and the dev server 404s on any link that forgets it.
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    // Astro 7 defaults to the Satteri processor; remark-math / rehype-katex are
    // unified plugins, so the unified processor stays opt-in here.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeImageAttrs, rehypeTableWrap],
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
