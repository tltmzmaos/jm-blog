import type { CollectionEntry } from 'astro:content';

export interface SeriesInfo {
  name: string;
  currentPart: number;
  totalParts: number;
  parts: Array<{ slug: string; title: string; partNumber: number }>;
}

/**
 * Extract part number from a post filename.
 * Supports: "part1-xxx", "part2-xxx", "1-xxx", "2-xxx"
 */
function extractPartNumber(slug: string): number | null {
  const filename = slug.split('/').pop() || '';
  const partMatch = filename.match(/^part(\d+)/i);
  if (partMatch) return parseInt(partMatch[1], 10);
  const numMatch = filename.match(/^(\d+)-/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

/**
 * Format a series directory name into a readable title.
 * e.g., "clean-architecture" → "Clean Architecture"
 */
function formatSeriesName(dir: string): string {
  return dir
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Detect if a post belongs to a numbered series and return series info.
 */
export function getSeriesInfo(
  currentPost: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[]
): SeriesInfo | null {
  const slug = currentPost.slug;
  const parts = slug.split('/');
  if (parts.length < 2) return null;

  const dir = parts[0];
  const currentPartNum = extractPartNumber(slug);
  if (currentPartNum === null) return null;

  // Find all posts in the same directory with a part number
  const seriesPosts = allPosts
    .filter(post => {
      if (!post.slug.startsWith(dir + '/')) return false;
      return extractPartNumber(post.slug) !== null;
    })
    .map(post => ({
      slug: post.slug,
      title: post.data.title,
      partNumber: extractPartNumber(post.slug)!,
    }))
    .sort((a, b) => a.partNumber - b.partNumber);

  // Need at least 2 numbered posts to form a series
  if (seriesPosts.length < 2) return null;

  return {
    name: formatSeriesName(dir),
    currentPart: currentPartNum,
    totalParts: seriesPosts.length,
    parts: seriesPosts,
  };
}
