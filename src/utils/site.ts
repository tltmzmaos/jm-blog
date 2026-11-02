export const SITE_TITLE = 'Jongmin Lee';

export const SITE_DESCRIPTION =
  "Notes on software engineering, working with AI, and what I'm picking up along the way.";

export const GITHUB_URL = 'https://github.com/tltmzmaos';
export const LINKEDIN_URL = 'https://linkedin.com/in/jml1228';
export const EMAIL = 'tltmzmaos@gmail.com';

/**
 * Where I've worked, newest first, as the About page lists it. An entry is
 * its field and a few words on the work there, not everything I did.
 */
export const CAREER: { dates: string; label: string; detail: string }[] = [
  {
    dates: 'Jun 2026 – now',
    label: 'Enterprise AI',
    detail: 'New AI products, from idea to production',
  },
  {
    dates: 'Aug 2025 – May 2026',
    label: 'Life Sciences',
    detail: 'Lab automation, equipment orchestration',
  },
  {
    dates: 'Jun 2021 – Aug 2025',
    label: 'Automotive',
    detail: 'Vehicle diagnostics, pre/after-sales',
  },
];

/** Schools, as the About page lists them. */
export const EDUCATION: { dates: string; school: string; degree: string }[] = [
  {
    dates: 'Expected Dec 2027',
    school: 'Georgia Tech',
    degree: 'M.S. in Computer Science (OMSCS)',
  },
  {
    dates: 'Jun 2021',
    school: 'UC Irvine',
    degree: 'B.S. in Computer Science',
  },
];

// Rendered by src/pages/og.png.ts.
export const DEFAULT_OG_IMAGE = '/og.png';
