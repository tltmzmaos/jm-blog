# Jongmin's Dev Blog

Personal tech blog built with Astro. Writing about software engineering, architecture, ML, and practical experience.

**Site:** [jongmin.me](https://jongmin.me)

## Tech Stack

- **Framework:** Astro 7.x (Static Site Generation)
- **Styling:** Hand-written CSS with CSS custom properties (scoped `<style>` blocks per component)
- **Content:** MDX, KaTeX (math), Mermaid (diagrams)
- **Search:** Fuse.js (client-side fuzzy search)
- **OG Images:** Satori + Sharp (dynamic generation)
- **Linting:** ESLint + Prettier
- **Hosting:** GitHub Pages

## Features

- Dark mode with system preference detection
- Full-text search with Fuse.js
- Tag-based post organization
- Series navigation for multi-part posts
- Table of contents (auto-generated)
- Social share buttons
- Skip-to-content accessibility link
- SEO with JSON-LD structured data and breadcrumbs
- Self-hosted Inter font (Latin subset)
- Dynamic OG image generation per post
- Sitemap via @astrojs/sitemap
- Series index page and a JSON post API (`/api/posts.json`)

## Project Structure

```text
src/
├── components/        # Astro components
│   ├── Header.astro
│   ├── SearchBox.astro
│   ├── ThemeToggle.astro
│   ├── TableOfContents.astro
│   ├── PostListItem.astro
│   └── SEO.astro
├── content/
│   ├── blog/          # Blog posts (Markdown/MDX)
│   │   ├── dev/
│   │   ├── ml-stanford/
│   │   └── omscs/
│   └── series/        # Series metadata (JSON)
├── content.config.ts  # Collection schemas + loaders
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── 404.astro
│   ├── posts/[...slug].astro
│   ├── series/index.astro
│   ├── tags/
│   ├── api/posts.json.ts
│   ├── og/[...slug].png.ts
│   └── robots.txt.ts
├── types/
└── utils/
```

## Images

Originals live in `image-originals/` (not published). `npm run images` writes
resized WebP copies into `public/` at the same relative path, and posts
reference the `.webp`. Add a new screenshot to `image-originals/<post-dir>/`,
run the script, then link `/[post-dir]/[name].webp` from the post.

## Commands

```bash
npm run dev            # Dev server (localhost:4321)
npm run build          # Production build
npm run preview        # Preview build
npm run check          # Astro type check
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm run images         # Convert image-originals/ to WebP in public/
```

## License

MIT
