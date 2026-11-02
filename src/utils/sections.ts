export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface Section {
  slug: string;
  text: string;
}

/** A post's sections: its h2s, for the contents list and the running header. */
export function postSections(headings: Heading[]): Section[] {
  return headings
    .filter((h) => h.depth === 2)
    .map(({ slug, text }) => ({ slug, text }));
}
