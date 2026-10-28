import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { newestFirst, numberEntries } from '../../utils/entryNumbers';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const entries = numberEntries(posts);

  const postsData = posts
    .filter((post) => !post.data.draft)
    .map((post) => ({
      slug: post.id,
      entry: entries.get(post.id),
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      pubDate: post.data.pubDate,
      author: post.data.author,
    }))
    .sort(newestFirst);

  return new Response(JSON.stringify(postsData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
