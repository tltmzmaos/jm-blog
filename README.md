# Jongmin's Dev Blog

Personal tech blog built with Astro. Writing about software engineering, architecture, ML, and practical experience.

**Site:** [jongmin.me](https://jongmin.me)

## Tech Stack

- **Framework:** Astro 5.x (Static Site Generation)
- **Styling:** Tailwind CSS + Typography plugin
- **Content:** MDX, KaTeX (math), Mermaid (diagrams)
- **Search:** Fuse.js (client-side fuzzy search)
- **OG Images:** Satori + Sharp (dynamic generation)
- **Like System:** GitHub Gist-based
- **Linting:** ESLint + Prettier
- **Hosting:** Cloudflare Pages

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
- Custom sitemap with content-based lastmod

## Project Structure

```text
src/
├── components/        # Astro components
│   ├── Header.astro
│   ├── SearchBox.astro
│   ├── ThemeToggle.astro
│   ├── LikeButton.astro
│   ├── TableOfContents.astro
│   ├── PostListItem.astro
│   └── SEO.astro
├── content/
│   └── blog/          # Blog posts (Markdown/MDX)
│       ├── clean-architecture/
│       ├── clean-code/
│       ├── dev-practices/
│       ├── ml-stanford/
│       └── omscs/
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── posts/[...slug].astro
│   ├── tags/
│   ├── og/[...slug].png.ts
│   ├── sitemap.xml.ts
│   └── robots.txt.ts
├── types/
└── utils/
```

## Commands

```bash
npm run dev            # Dev server (localhost:4321)
npm run build          # Production build
npm run preview        # Preview build
npm run check          # Astro type check
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
```

## Environment Variables

```env
PUBLIC_GITHUB_TOKEN=   # GitHub token (gist scope) for like system
PUBLIC_GIST_ID=        # GitHub Gist ID for storing likes
```

## License

MIT
