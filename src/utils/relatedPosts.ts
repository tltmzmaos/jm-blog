import type { CollectionEntry } from 'astro:content';

interface RelatedPost {
  slug: string;
  title: string;
  description?: string;
}

/**
 * Find related posts based on tags.
 * Posts with more common tags are considered more related.
 */
export function getRelatedPosts(
  currentPost: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[],
  limit: number = 3
): RelatedPost[] {
  const currentTags = currentPost.data.tags || [];

  if (currentTags.length === 0) {
    return [];
  }

  const scored = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const postTags = post.data.tags || [];
      const commonTags = currentTags.filter(tag => postTags.includes(tag));
      return {
        post,
        score: commonTags.length
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Sort by common tag count first, then by newest
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
    })
    .slice(0, limit);

  return scored.map(item => ({
    slug: item.post.slug,
    title: item.post.data.title,
    description: item.post.data.description
  }));
}
