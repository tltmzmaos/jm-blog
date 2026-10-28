/**
 * The topic shelves on the home page, top to bottom. Each shelf takes its
 * posts from one series (by the series' directory under src/content/blog)
 * or from tags. A post sits on the first shelf that takes it, so a series
 * post never shows again on a tag shelf further down. A shelf with no posts
 * is left out.
 *
 * Titles and descriptions describe the posts on the shelf; they are not
 * claims about expertise.
 */
export type ShelfSource =
  /** Every post of a series, shown as the series' part strip. */
  | { series: string }
  /** Posts that carry all of these tags, newest first. */
  | { allTags: string[] };

export interface Shelf {
  title: string;
  description: string;
  from: ShelfSource;
}

export const shelves: Shelf[] = [
  {
    // DRAFT: confirm with author
    title: 'AI-assisted development',
    // DRAFT: confirm with author
    description:
      'Using AI coding tools at work, on my own and across a team, and how Claude Code handles a request.',
    from: { allTags: ['AI', 'Software Engineering'] },
  },
  {
    // DRAFT: confirm with author
    title: 'Georgia Tech OMSCS',
    // DRAFT: confirm with author
    description:
      'One post per course: machine learning for trading, AI for robotics, software process, knowledge-based AI and AI ethics.',
    from: { series: 'omscs' },
  },
  {
    // DRAFT: confirm with author
    title: 'Machine learning fundamentals',
    // DRAFT: confirm with author
    description:
      "Notes from Andrew Ng's Machine Learning Specialization, from linear regression to clustering.",
    from: { series: 'ml-stanford' },
  },
  {
    // DRAFT: confirm with author
    title: 'Software engineering',
    // DRAFT: confirm with author
    description:
      'Notes from shipping software, such as installing it on machines without internet access.',
    from: { allTags: ['Software Engineering'] },
  },
];
