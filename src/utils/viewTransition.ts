/**
 * The view-transition-name a post's title carries in the post lists and as
 * the h1 of the post, so a cross-document view transition morphs one into
 * the other. Slugs contain slashes and dots, which a CSS custom-ident can't;
 * anything other than letters, digits, "_" and "-" becomes a hyphen.
 *
 *   postTitleTransitionName('ml-stanford/2-regression')
 *   // 'post-title-ml-stanford-2-regression'
 */
export function postTitleTransitionName(slug: string): string {
  const ident = slug
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return `post-title-${ident}`;
}

/**
 * Two equal view-transition-names on one page cancel the whole transition,
 * so a page that would render them fails the build instead. Pass the slugs
 * of every title on the page that carries a name.
 */
export function assertUniqueTransitionNames(slugs: string[]): void {
  const owners = new Map<string, string>();
  for (const slug of slugs) {
    const name = postTitleTransitionName(slug);
    const owner = owners.get(name);
    if (owner !== undefined) {
      throw new Error(`Posts "${owner}" and "${slug}" share the name ${name}.`);
    }
    owners.set(name, slug);
  }
}
