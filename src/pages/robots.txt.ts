import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString() || 'https://jongminlee.dev';
  const siteUrl = baseUrl.replace(/\/$/, '');

  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin/private areas (if any)
Disallow: /admin/
Disallow: /.well-known/
Disallow: /api/

# Allow important files
Allow: /favicon.ico
Allow: /robots.txt
Allow: /sitemap.xml

# SEO optimizations
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
