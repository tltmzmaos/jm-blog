/**
 * Display form of a tag after its "#": lowercase, with spaces as hyphens
 * ("Machine Learning" -> "machine-learning", ".NET" -> ".net").
 */
export function tagLabel(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}
