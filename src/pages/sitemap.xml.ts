import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog');
  const baseUrl = site?.toString() || 'https://jongminlee.dev';
  
  // Remove trailing slash
  const siteUrl = baseUrl.replace(/\/$/, '');
  
  // Static pages
  const staticPages = [
    {
      url: `${siteUrl}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${siteUrl}/posts/`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${siteUrl}/tags/`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      url: `${siteUrl}/about/`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    }
  ];
  
  // Blog posts
  const blogPages = posts
    .filter((post: CollectionEntry<'blog'>) => !post.data.draft)
    .map((post: CollectionEntry<'blog'>) => ({
      url: `${siteUrl}/posts/${post.slug}/`,
      lastmod: post.data.updatedDate?.toISOString() || post.data.pubDate.toISOString(),
      changefreq: 'monthly',
      priority: '0.9'
    }));
  
  // Get unique tags
  const allTags = [...new Set(posts.flatMap((post: CollectionEntry<'blog'>) => post.data.tags || []))];
  const tagPages = allTags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag: string) => ({
      url: `${siteUrl}/tags/${tag}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.5'
    }));
  
  const allPages = [...staticPages, ...blogPages, ...tagPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};