import { getCollection, type CollectionEntry } from 'astro:content';
import { shouldShowDrafts } from './env';

export interface SeriesPostEntry {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  partNumber?: number;
}

export interface SeriesWithPosts {
  id: string;
  title: string;
  description: string;
  dir: string;
  status: 'complete' | 'ongoing';
  sortBy: 'part' | 'date';
  featured: boolean;
  posts: SeriesPostEntry[];
  count: number;
  firstDate?: Date;
  lastDate?: Date;
}

function extractPartNumber(slug: string): number | null {
  const filename = slug.split('/').pop() || '';
  const partMatch = filename.match(/^part(\d+)/i);
  if (partMatch) return parseInt(partMatch[1], 10);
  const numMatch = filename.match(/^(\d+)-/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

/**
 * Strip "<Series Name> Part N:" prefix from a post title for display in
 * series indexes. Keeps short, repetition-free entries like
 * "Design and Programming Paradigms" instead of the full canonical title.
 */
export function stripSeriesPrefix(title: string): string {
  return (
    title
      .replace(/^.+?\bpart\s*\d+\s*[:\-–—]\s*/i, '')
      .replace(/^.+?\b\d+\s*[:\-–—]\s*/, '')
      .trim() || title
  );
}

/**
 * Strip trailing " - OMSCS YYYY Season" tag from course-note titles.
 */
export function stripOmscsSuffix(title: string): string {
  return title
    .replace(
      /\s*[-–—]\s*OMSCS\s+\d{4}\s+(Spring|Summer|Fall|Winter)\s*$/i,
      ''
    )
    .trim();
}

/**
 * Format a post title for display inside a series index, based on
 * the series' sort mode and directory.
 */
export function displayPartTitle(
  title: string,
  series: { dir: string; sortBy: 'part' | 'date' }
): string {
  if (series.sortBy === 'part') return stripSeriesPrefix(title);
  if (series.dir === 'omscs') return stripOmscsSuffix(title);
  return title;
}

export async function getAllSeries(): Promise<SeriesWithPosts[]> {
  const showDrafts = shouldShowDrafts();
  const seriesEntries = await getCollection('series');
  const allPosts = await getCollection('blog');

  const visiblePosts = allPosts.filter(
    (p: CollectionEntry<'blog'>) => showDrafts || !p.data.draft
  );

  return seriesEntries
    .map((entry) => {
      const meta = entry.data;
      const matched = visiblePosts.filter((p) =>
        p.slug.startsWith(meta.dir + '/')
      );

      const posts: SeriesPostEntry[] = matched
        .map((p) => {
          const part = extractPartNumber(p.slug);
          return {
            slug: p.slug,
            title: p.data.title,
            description: p.data.description,
            pubDate: p.data.pubDate,
            partNumber: part ?? undefined,
          };
        })
        .sort((a, b) => {
          if (meta.sortBy === 'date') {
            return a.pubDate.valueOf() - b.pubDate.valueOf();
          }
          // sort by part number, fall back to date
          const ap = a.partNumber ?? Number.MAX_SAFE_INTEGER;
          const bp = b.partNumber ?? Number.MAX_SAFE_INTEGER;
          if (ap !== bp) return ap - bp;
          return a.pubDate.valueOf() - b.pubDate.valueOf();
        });

      const dates = posts.map((p) => p.pubDate.valueOf());
      const firstDate = dates.length ? new Date(Math.min(...dates)) : undefined;
      const lastDate = dates.length ? new Date(Math.max(...dates)) : undefined;

      return {
        id: entry.id,
        ...meta,
        posts,
        count: posts.length,
        firstDate,
        lastDate,
      } satisfies SeriesWithPosts;
    })
    .sort((a, b) => {
      // Most recent activity first; series with no posts go to the end.
      const al = a.lastDate?.valueOf() ?? 0;
      const bl = b.lastDate?.valueOf() ?? 0;
      return bl - al;
    });
}
