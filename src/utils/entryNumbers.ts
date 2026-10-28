import { getCollection, type CollectionEntry } from 'astro:content';

type Post = Pick<CollectionEntry<'blog'>, 'id' | 'data'>;

const fileName = (id: string) => id.split('/').pop() ?? id;

// Plain code-point order, so the result never depends on the build
// machine's locale.
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Each published post's entry number, by post id: its place in publishing
 * order, oldest first, starting at 1. Posts published at the same moment
 * are ordered by file name, then by path. Drafts are never counted, also
 * when the dev server shows them, so every number matches production.
 *
 * A number stays with its post as long as new posts are dated after the
 * newest one; backdating a post renumbers everything after it.
 */
export function numberEntries(posts: Post[]): Map<string, number> {
  const published = posts
    .filter((post) => !post.data.draft)
    .sort(
      (a, b) =>
        a.data.pubDate.valueOf() - b.data.pubDate.valueOf() ||
        compare(fileName(a.id), fileName(b.id)) ||
        compare(a.id, b.id)
    );

  const numbers = new Map<string, number>();
  published.forEach((post, i) => numbers.set(post.id, i + 1));
  assertUniqueEntryNumbers(numbers, published.length);
  return numbers;
}

/** Entry numbers of the blog collection, by post id. */
export async function getEntryNumbers(): Promise<Map<string, number>> {
  return numberEntries(await getCollection('blog'));
}

/** Fails the build unless every published post has its own number, 1 to n. */
export function assertUniqueEntryNumbers(
  numbers: Map<string, number>,
  count: number
): void {
  const owners = new Map<number, string>();
  for (const [id, n] of numbers) {
    const owner = owners.get(n);
    if (owner !== undefined) {
      throw new Error(`Posts "${owner}" and "${id}" share entry number ${n}.`);
    }
    if (!Number.isInteger(n) || n < 1 || n > count) {
      throw new Error(
        `Post "${id}" has entry number ${n}, outside 1-${count}.`
      );
    }
    owners.set(n, id);
  }
  if (owners.size !== count) {
    throw new Error(
      `${count} published posts but ${owners.size} entry numbers.`
    );
  }
}

/**
 * Newest first: by date, and posts of the same date by entry number, so
 * every list agrees on their order. Drafts (no number) sort by date only.
 */
export function newestFirst(
  a: { pubDate: Date; entry?: number },
  b: { pubDate: Date; entry?: number }
): number {
  return (
    b.pubDate.valueOf() - a.pubDate.valueOf() || (b.entry ?? 0) - (a.entry ?? 0)
  );
}

/** Three digits, as printed after the "№": 7 -> "007". */
export function formatEntryNumber(n: number): string {
  return String(n).padStart(3, '0');
}
