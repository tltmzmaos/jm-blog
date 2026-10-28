import type { ResolvedShelf } from './shelves';

export interface TimelineMark {
  slug: string;
  title: string;
  pubDate: Date;
  entry?: number;
  /** Where the mark is drawn, 0 (the left end) to 1 (now). */
  x: number;
  /** The newest post of all, drawn with the highlighter. */
  newest: boolean;
}

export interface TimelineLane {
  title: string;
  marks: TimelineMark[];
}

export interface Timeline {
  lanes: TimelineLane[];
  start: Date;
  end: Date;
  /** January 1 of each year after the start, as positions on the axis. */
  years: { year: number; x: number }[];
}

/**
 * Marks closer than this (a share of the axis, about 4px of the 696px
 * column) are spread apart, so each can be pointed at. A burst of posts
 * keeps its center: the marks fan out around their average date.
 */
const MIN_GAP = 0.006;

function spread(xs: number[]): number[] {
  // Each run of marks is laid out MIN_GAP apart, centered on the average
  // of its dates. Runs that then touch merge into one, until none do.
  type Run = { from: number; xs: number[] };
  const place = (xs: number[]): Run => {
    const mid = xs.reduce((a, b) => a + b, 0) / xs.length;
    const width = MIN_GAP * (xs.length - 1);
    return { from: Math.min(Math.max(0, mid - width / 2), 1 - width), xs };
  };
  const runs: Run[] = [];
  for (const x of xs) {
    runs.push(place([x]));
    while (runs.length > 1) {
      const b = runs[runs.length - 1];
      const a = runs[runs.length - 2];
      if (a.from + MIN_GAP * a.xs.length <= b.from) break;
      runs.splice(-2, 2, place([...a.xs, ...b.xs]));
    }
  }
  return runs.flatMap((run) => run.xs.map((_, k) => run.from + MIN_GAP * k));
}

/**
 * The home page's topic timeline: one lane per shelf (src/data/shelves.ts,
 * same order and titles), each post a mark at its date in the lane of the
 * shelf that shows it. The axis runs from the first day of the first
 * post's month to `now` (the build).
 */
export function buildTimeline(
  shelves: ResolvedShelf[],
  entries: Map<string, number>,
  now: Date
): Timeline {
  type Post = { slug: string; title: string; pubDate: Date };
  const postsOf = (shelf: ResolvedShelf): Post[] =>
    shelf.kind === 'series' ? shelf.series.posts : shelf.posts;

  const all = shelves.flatMap(postsOf);
  const first = Math.min(...all.map((p) => p.pubDate.valueOf()));
  const firstDate = new Date(first);
  const start = new Date(
    Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1)
  );
  const end = now;
  const span = end.valueOf() - start.valueOf();
  const at = (d: Date) => (d.valueOf() - start.valueOf()) / span;

  const newest = all.reduce((a, b) =>
    b.pubDate > a.pubDate ||
    (b.pubDate.valueOf() === a.pubDate.valueOf() &&
      (entries.get(b.slug) ?? 0) > (entries.get(a.slug) ?? 0))
      ? b
      : a
  );

  const lanes = shelves.map((shelf) => {
    const posts = [...postsOf(shelf)].sort(
      (a, b) =>
        a.pubDate.valueOf() - b.pubDate.valueOf() ||
        (entries.get(a.slug) ?? 0) - (entries.get(b.slug) ?? 0)
    );
    const xs = spread(posts.map((p) => at(p.pubDate)));
    return {
      title: shelf.title,
      marks: posts.map((p, i) => ({
        slug: p.slug,
        title: p.title,
        pubDate: p.pubDate,
        entry: entries.get(p.slug),
        x: xs[i],
        newest: p.slug === newest.slug,
      })),
    };
  });

  const years = [];
  for (let y = start.getUTCFullYear() + 1; y <= end.getUTCFullYear(); y++) {
    years.push({ year: y, x: at(new Date(Date.UTC(y, 0, 1))) });
  }

  return { lanes, start, end, years };
}
