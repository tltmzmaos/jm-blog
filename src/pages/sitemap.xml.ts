import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('blog');
  const publishedPosts = posts.filter(
    (post: CollectionEntry<'blog'>) => !post.data.draft
  );
  const baseUrl = site?.toString() || 'https://jongmin.me';
  const siteUrl = baseUrl.replace(/\/$/, '');

  // Most recent post date for static pages
  const mostRecentDate = publishedPosts
    .map((p) => p.data.updatedDate || p.data.pubDate)
    .sort((a, b) => b.valueOf() - a.valueOf())[0];
  const globalLastmod =
    mostRecentDate?.toISOString() || new Date().toISOString();

  const staticPages = [
    {
      url: `${siteUrl}/`,
      lastmod: globalLastmod,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      url: `${siteUrl}/posts/`,
      lastmod: globalLastmod,
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: `${siteUrl}/tags/`,
      lastmod: globalLastmod,
      changefreq: 'weekly',
      priority: '0.7',
    },
    {
      url: `${siteUrl}/about/`,
      lastmod: globalLastmod,
      changefreq: 'monthly',
      priority: '0.6',
    },
  ];

  const blogPages = publishedPosts.map((post: CollectionEntry<'blog'>) => ({
    url: `${siteUrl}/posts/${post.slug}/`,
    lastmod: (post.data.updatedDate || post.data.pubDate).toISOString(),
    changefreq: 'monthly',
    priority: '0.9',
  }));

  // Tag pages: lastmod = most recent post date within that tag
  const allTags = [
    ...new Set(
      publishedPosts.flatMap(
        (post: CollectionEntry<'blog'>) => post.data.tags || []
      )
    ),
  ];
  const tagPages = allTags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag: string) => {
      const tagPosts = publishedPosts.filter((p) => p.data.tags?.includes(tag));
      const latestDate = tagPosts
        .map((p) => p.data.updatedDate || p.data.pubDate)
        .sort((a, b) => b.valueOf() - a.valueOf())[0];
      return {
        url: `${siteUrl}/tags/${tag}/`,
        lastmod: latestDate?.toISOString() || globalLastmod,
        changefreq: 'weekly',
        priority: '0.5',
      };
    });

  const allPages = [...staticPages, ...blogPages, ...tagPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
