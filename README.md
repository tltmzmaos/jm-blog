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

- A small topic timeline on the home page: every post as a mark at its date, one lane per shelf, from the first post to now (src/utils/timeline.ts); arrow keys move between marks
- Home page by topic: the newest posts, then topic shelves (a series as a strip of its parts, or posts picked by tags); edit the shelves in `src/data/shelves.ts`
- Every post by year at `/posts/`
- Entry numbers: each published post is numbered by publishing order, oldest first (`№ 016`), in the lists, the post header and the OG card (src/utils/entryNumbers.ts). Drafts are not counted
- One highlighter color, used only behind text: selection, link hover, the current nav item and contents entry, the current series part
- Dark mode with system preference detection; code highlighting (Shiki, GitHub light and dark themes) follows it. Switching the theme reveals it in a circle from the toggle where view transitions exist
- Search over post titles, descriptions and tags with Fuse.js; matched words are marked
- Tag-based post organization
- Series navigation, driven by `src/content/series/*.json`
- `==text==` in a post marks the words with the highlighter (`<mark>`, src/plugins/remark-mark.mjs); code and math are left alone
- Post header: title, the description as a dek, and one row of facts (entry number, date, reading time, series part, tags)
- Section numbers on the h2s of posts with three or more, drawn by a CSS counter (src/utils/sections.ts); headings that already start with a number keep it
- A running header on posts: once the title scrolls away, a thin bar shows the title and the current section over a rail with one segment per section (src/scripts/reading.ts)
- Table of contents (auto-generated), numbered like the sections
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
│   ├── PostList.astro      # posts grouped by year
│   ├── PostListItem.astro
│   ├── SeriesStrip.astro   # one segment per part of a series
│   ├── Footer.astro        # colophon
│   └── SEO.astro
├── content/
│   ├── blog/          # Blog posts (Markdown)
│   │   ├── concepts/
│   │   ├── dev/
│   │   ├── ml-stanford/
│   │   └── omscs/
│   └── series/        # Series metadata (JSON)
├── content.config.ts  # Collection schemas + loaders
├── data/
│   └── shelves.ts     # topic shelves on the home page
├── layouts/
│   ├── BaseLayout.astro
│   └── PostLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── 404.astro
│   ├── posts/index.astro      # archive by year
│   ├── posts/[...slug].astro
│   ├── series/index.astro
│   ├── tags/
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
