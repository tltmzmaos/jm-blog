/**
 * URL slug for a tag page. GitHub Pages drops dot-prefixed directories from
 * the deploy artifact, so a leading dot is spelled out (".NET" -> "dotnet").
 * Everything else is lowercased, and runs of other characters become a hyphen.
 */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .replace(/^\./, 'dot')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
