export const SITE_TITLE = 'Jongmin Lee';

export const SITE_DESCRIPTION =
  "Notes on software engineering, working with AI, and what I'm picking up along the way.";

export const GITHUB_URL = 'https://github.com/tltmzmaos';
export const LINKEDIN_URL = 'https://linkedin.com/in/jml1228';
export const EMAIL = 'tltmzmaos@gmail.com';

/**
 * Where I've worked, newest first, as the About page lists it. Each entry
 * is the one place its years and label are written.
 */
export const CAREER: { years: string; label: string }[] = [
  { years: '2026 – now', label: 'Applied AI' },
  { years: '2025 – 2026', label: 'Lab automation (life sciences)' },
  { years: '2021 – 2025', label: 'Automotive services' },
];

/** Schools, as the About page lists them. */
export const EDUCATION: string[] = [
  'Georgia Tech — M.S. in Computer Science (OMSCS), in progress',
  'UC Irvine — Computer Science',
];

// Rendered by src/pages/og.png.ts.
export const DEFAULT_OG_IMAGE = '/og.png';
