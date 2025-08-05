# Jongmin's Dev Blog

A modern, fast, and feature-rich blog built with Astro, designed for sharing development experiences and technical insights.

## ✨ Features

- **🌙 Dark Mode**: Beautiful dark theme with modern GitHub-style colors
- **🔍 Search**: Real-time search functionality with Fuse.js
- **📱 Responsive**: Mobile-first design that works on all devices
- **⚡ Fast**: Built with Astro for optimal performance
- **📝 Markdown**: Full markdown support with syntax highlighting
- **🏷️ Tags**: Organize posts with a flexible tagging system
- **💝 Like System**: Interactive like system with multiple storage options
- **📋 Copy Code**: One-click code copying with visual feedback
- **🧭 Navigation**: Previous/next post navigation
- **📑 Table of Contents**: Auto-generated TOC for long posts
- **🎨 Modern UI**: Clean, professional design inspired by Velog
- **♿ Accessible**: Built with accessibility best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jongmin-blog.git
cd jongmin-blog
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser.

## 📝 Writing Posts

### Creating a New Post

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields:

```markdown
---
title: 'Your Post Title'
description: 'Brief description for SEO'
pubDate: 2024-01-15
heroImage: '/images/posts/hero.jpg' # Optional
tags: ['javascript', 'tutorial']
author: 'Jongmin'
draft: false
---

# Your Post Content

Write your content here using Markdown...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Post title (50-60 chars for SEO) |
| `description` | ✅ | Meta description (150-160 chars) |
| `pubDate` | ✅ | Publication date (YYYY-MM-DD) |
| `heroImage` | ❌ | Featured image path |
| `tags` | ❌ | Array of tags |
| `author` | ❌ | Author name (defaults to 'Jongmin') |
| `draft` | ❌ | Hide from public (defaults to false) |

## 🖼️ Images

### Image Organization

Store images in the `public/images/` directory:

```
public/images/
├── posts/
│   ├── 2024/
│   │   └── 01/
│   │       └── my-post-image.jpg
│   └── thumbnails/
│       └── post-hero.jpg
└── assets/
    └── site-logo.png
```

### Using Images in Posts

```markdown
![Alt text](/images/posts/2024/01/screenshot.png)

<!-- Hero image in frontmatter -->
---
heroImage: '/images/thumbnails/hero.jpg'
---
```

## 🎨 Customization

### Colors and Themes

The blog uses a modern dark theme with GitHub-inspired colors. You can customize colors in `tailwind.config.mjs`:

```javascript
colors: {
  dark: {
    bg: '#0d1117',        // Main background
    surface: '#161b22',   // Card backgrounds
    border: '#30363d',    // Borders
    text: '#f0f6fc',      // Primary text
    subtext: '#8b949e',   // Secondary text
    accent: '#58a6ff',    // Links and accents
  }
}
```

### Logo

Replace the JL logo by editing `src/components/Logo.astro` or updating the SVG files in the `public/` directory.

## 💝 Like System Setup

The blog supports multiple storage options for the like system:

### Option 1: JSONBin.io (Recommended)

1. Create a free account at [JSONBin.io](https://jsonbin.io)
2. Create a new bin with empty JSON: `{}`
3. Add environment variables:

```env
PUBLIC_JSONBIN_API_KEY=your_api_key
PUBLIC_JSONBIN_BIN_ID=your_bin_id
```

### Option 2: Firebase Firestore

1. Create a Firebase project
2. Enable Firestore
3. Add environment variables:

```env
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_API_KEY=your_api_key
```

### Option 3: Local Storage Only

If no environment variables are set, the like system will use local storage only.

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run astro        # Run Astro CLI commands
```

### Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── content/         # Blog posts and content
│   │   └── blog/        # Markdown blog posts
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── astro.config.mjs     # Astro configuration
└── tailwind.config.mjs  # Tailwind configuration
```

## 🚀 Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import your GitHub repository to Vercel
2. Vercel will auto-detect Astro settings
3. Add environment variables in Vercel dashboard

### GitHub Pages

1. Enable GitHub Actions in your repository
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: actions/deploy-pages@v1
        with:
          artifact_name: github-pages
          folder: dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Search powered by [Fuse.js](https://fusejs.io/)
- Icons from [Heroicons](https://heroicons.com/)
- Inspired by [Velog](https://velog.io/)

## 📞 Contact

- **Author**: Jongmin
- **Email**: your-email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Blog**: [https://your-blog.com](https://your-blog.com)

---

Made with ❤️ and ☕ by Jongmin