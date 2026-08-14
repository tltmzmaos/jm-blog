/**
 * Detects whether a markdown body actually contains KaTeX math.
 *
 * The KaTeX stylesheet is ~23KB plus font files, so it is only worth loading on
 * pages that render math. Code spans and fenced blocks are stripped first:
 * shell snippets like `$(echo $VAR)` and `$ARGUMENTS` are not math, and treating
 * them as such pulls the stylesheet into posts that never use it.
 */
export function hasMathContent(body?: string): boolean {
  if (!body) return false;

  const prose = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');

  // Block math: $$ ... $$
  if (/\$\$[\s\S]+?\$\$/.test(prose)) return true;

  // Inline math: $...$ on a single line. remark-math ignores a delimiter
  // followed by whitespace, which is what separates math from prose dollars.
  return /\$(?!\s)[^$\n]*[^\s$]\$/.test(prose);
}
