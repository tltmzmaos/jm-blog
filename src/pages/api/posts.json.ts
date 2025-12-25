import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');

  const postsData = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(post => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      pubDate: post.data.pubDate,
      author: post.data.author,
    }));

  return new Response(JSON.stringify(postsData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};