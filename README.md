# Jongmin's Dev Blog

Personal tech blog built with Astro. Writing about software engineering, architecture, ML, and practical experience.

**Site:** [jongmin.me](https://jongmin.me)

## Tech Stack

- **Framework:** Astro 7.x (Static Site Generation)
- **Styling:** Hand-written CSS with CSS custom properties (scoped `<style>` blocks per component)
- **Content:** Markdown with KaTeX (math)
- **Search:** Fuse.js (client-side fuzzy search, loaded on first use)
- **OG Images:** Satori + Sharp (dynamic generation)
- **Linting:** ESLint + Prettier
- **Hosting:** GitHub Pages

## Features

- Home page: every post newest first (title, date, description)
- A "JL" monogram in the header (src/components/Monogram.astro); the favicon, touch icon and OG card footer use the same mark
- Footer: © line on the left, GitHub / LinkedIn / Email / RSS icons on the right; contact links live only here
- One highlighter color, used only behind text: selection, link hover, the current contents entry, the current series part
- Dark mode with system preference detection; code highlighting (Shiki, GitHub light and dark themes) follows it. Switching the theme reveals it in a circle from the toggle where view transitions exist
- Search over post titles, descriptions and tags with Fuse.js; matched words are marked
- Series navigation, driven by `src/content/series/*.json`
- `==text==` in a post marks the words with the highlighter (`<mark>`, src/plugins/remark-mark.mjs); code and math are left alone
- Post header: title, the description as a dek, and one row of facts (date, reading time, series part)
- A running header on posts: once the title scrolls away, a thin bar shows the title and the current section over a rail with one segment per section (src/scripts/reading.ts)
- Table of contents (auto-generated); the highlighter behind the current entry glides from entry to entry
- Image zoom: a post image drawn smaller than its file opens in a native `<dialog>`, as large as the window allows, growing out of its place where view transitions exist (src/scripts/zoom.ts)
- Copy-link button
- Skip-to-content accessibility link
- SEO with JSON-LD structured data and breadcrumbs
- Self-hosted IBM Plex Sans and Plex Mono (Latin subset), with size-matched local fallbacks so the swap does not move text
- Native cross-document view transitions in CSS, no client-side router; a post's title morphs from the list into the post
- A 404 page that suggests the post closest to the address asked for
- Print styles: a post prints as plain light notes
- Generated OG image per post, plus a default card (`/og.png`)
- RSS feed (`/rss.xml`) and sitemap via @astrojs/sitemap
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
│   ├── SeriesStrip.astro   # one segment per part of a series (a picture, not links)
│   ├── Footer.astro        # © line and profile/feed icons
│   └── SEO.astro
├── content/
│   ├── blog/          # Blog posts (Markdown)
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
│   ├── api/posts.json.ts
│   ├── og/[...slug].png.ts
│   ├── og.png.ts
│   ├── rss.xml.ts
│   └── robots.txt.ts
├── plugins/           # remark and rehype plugins
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
