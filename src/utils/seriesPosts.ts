import { displayPartTitle, type SeriesWithPosts } from './seriesIndex';

export interface SeriesPart {
  slug: string;
  title: string;
  partNumber: number;
}

export interface SeriesInfo {
  name: string;
  /** Anchor of this series on the /series/ page. */
  id: string;
  currentPart: number;
  totalParts: number;
  parts: SeriesPart[];
  prev?: SeriesPart;
  next?: SeriesPart;
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
    title: displayPartTitle(p.title, series),
    partNumber: i + 1,
  }));
  const index = parts.findIndex((p) => p.slug === postId);

  return {
    name: series.title,
    id: series.dir,
    currentPart: index + 1,
    totalParts: parts.length,
    parts,
    prev: parts[index - 1],
    next: parts[index + 1],
  };
}
