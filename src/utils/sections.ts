export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface Section {
  slug: string;
  text: string;
  /** Section number, when the post's sections are numbered. */
  n?: number;
}

/** Posts with fewer numbered sections than this are left unnumbered. */
export const MIN_NUMBERED_SECTIONS = 3;

/**
 * A heading that already starts with its own number ("2. Regression...")
 * keeps it and isn't counted. Its id then starts with a digit too, which
 * is how the CSS counter in PostLayout skips it: keep the two in step.
 */
export const hasOwnNumber = (slug: string) => /^\d/.test(slug);

/**
 * A post's sections (its h2s), numbered 1, 2, 3... when it has at least
 * MIN_NUMBERED_SECTIONS of them. The numbers are drawn by a CSS counter
 * on the headings; these are the same numbers for the contents list and
 * the running header.
 */
export function postSections(headings: Heading[]): {
  sections: Section[];
  numbered: boolean;
} {
  const h2s = headings.filter((h) => h.depth === 2);
  const numbered =
    h2s.filter((h) => !hasOwnNumber(h.slug)).length >= MIN_NUMBERED_SECTIONS;
  let n = 0;
  const sections = h2s.map(({ slug, text }) => ({
    slug,
    text,
    n: numbered && !hasOwnNumber(slug) ? ++n : undefined,
  }));
  return { sections, numbered };
}
