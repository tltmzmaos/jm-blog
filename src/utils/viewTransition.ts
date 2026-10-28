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
