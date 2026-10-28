import { shelves } from '../data/shelves';
import type { SeriesWithPosts } from './seriesIndex';
import { seriesParts, type SeriesPart } from './seriesPosts';

export interface ShelfPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  tags: string[];
}

interface ShelfBase {
  title: string;
  description: string;
}

export type ResolvedShelf =
  | (ShelfBase & {
      kind: 'series';
      series: SeriesWithPosts;
      parts: SeriesPart[];
    })
  | (ShelfBase & { kind: 'posts'; posts: ShelfPost[] });

/**
 * The shelves from src/data/shelves.ts with their posts filled in. Series
 * shelves own their posts wherever they sit in the list; tag shelves skip
 * those, and a post goes on the first tag shelf that takes it. Shelves
 * that end up empty are dropped.
 */
export function resolveShelves(
  posts: ShelfPost[],
  allSeries: SeriesWithPosts[]
): ResolvedShelf[] {
  const seriesOf = (dir: string) => allSeries.find((s) => s.dir === dir);

  const taken = new Set<string>();
  for (const shelf of shelves) {
    if ('series' in shelf.from) {
      seriesOf(shelf.from.series)?.posts.forEach((p) => taken.add(p.slug));
    }
  }

  const resolved: ResolvedShelf[] = [];
  for (const { title, description, from } of shelves) {
    if ('series' in from) {
      const series = seriesOf(from.series);
      if (series && series.count > 0) {
        resolved.push({
          title,
          description,
          kind: 'series',
          series,
          parts: seriesParts(series),
        });
      }
      continue;
    }

    const picked = posts
      .filter(
        (p) =>
          !taken.has(p.slug) && from.allTags.every((t) => p.tags.includes(t))
      )
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
    picked.forEach((p) => taken.add(p.slug));
    if (picked.length > 0) {
      resolved.push({ title, description, kind: 'posts', posts: picked });
    }
  }
  return resolved;
}
