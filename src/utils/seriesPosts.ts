import type { SeriesWithPosts } from './seriesIndex';

export interface SeriesInfo {
  name: string;
  currentPart: number;
  totalParts: number;
  parts: Array<{ slug: string; title: string; partNumber: number }>;
}

/**
 * Series navigation for a post, built from the series metadata in
 * src/content/series. Parts are numbered by position in the series' own
 * order (part number or date), so date-sorted series get navigation too.
 */
export function getSeriesInfo(
  postId: string,
  allSeries: SeriesWithPosts[]
): SeriesInfo | null {
  const series = allSeries.find((s) => s.posts.some((p) => p.slug === postId));
  if (!series || series.posts.length < 2) return null;

  const parts = series.posts.map((p, i) => ({
    slug: p.slug,
    title: p.title,
    partNumber: i + 1,
  }));

  return {
    name: series.title,
    currentPart: parts.findIndex((p) => p.slug === postId) + 1,
    totalParts: parts.length,
    parts,
  };
}
