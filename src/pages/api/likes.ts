import type { APIRoute } from 'astro';

type LikeData = Record<string, { count: number; users: string[] }>;

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GIST_ID = import.meta.env.GIST_ID;
const GIST_FILENAME = 'blog-likes.json';

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

async function fetchGistData(): Promise<LikeData> {
  if (!GITHUB_TOKEN || !GIST_ID) return {};

  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) return {};
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const gist = await res.json();
  const content = gist.files?.[GIST_FILENAME]?.content;
  return content ? JSON.parse(content) : {};
}

async function saveGistData(data: LikeData): Promise<boolean> {
  if (!GITHUB_TOKEN || !GIST_ID) return false;

  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(data) } },
    }),
  });

  return res.ok;
}

// Validate slug format (alphanumeric, hyphens, underscores only)
function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug) && slug.length <= 200;
}

// Validate userId format (UUID v4)
function isValidUserId(userId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
}

// GET: Fetch like count for a post
export const GET: APIRoute = async ({ request, url }) => {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');
  const userId = url.searchParams.get('userId');

  if (!slug || !isValidSlug(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!GITHUB_TOKEN || !GIST_ID) {
    return new Response(JSON.stringify({ count: 0, isLiked: false, disabled: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await fetchGistData();
    const post = data[slug] || { count: 0, users: [] };
    const isLiked = userId && isValidUserId(userId) ? post.users.includes(userId) : false;

    return new Response(JSON.stringify({ count: post.count, isLiked }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Like API GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch likes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Toggle like for a post
export const POST: APIRoute = async ({ request }) => {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!GITHUB_TOKEN || !GIST_ID) {
    return new Response(JSON.stringify({ error: 'Like feature is disabled' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { slug, userId } = body;

    if (!slug || !isValidSlug(slug)) {
      return new Response(JSON.stringify({ error: 'Invalid slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!userId || !isValidUserId(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await fetchGistData();
    const post = data[slug] || { count: 0, users: [] };
    const wasLiked = post.users.includes(userId);

    if (wasLiked) {
      post.count = Math.max(0, post.count - 1);
      post.users = post.users.filter((id) => id !== userId);
    } else {
      post.count++;
      post.users.push(userId);
    }

    data[slug] = post;
    const saved = await saveGistData(data);

    if (!saved) {
      return new Response(JSON.stringify({ error: 'Failed to save' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ count: post.count, isLiked: !wasLiked }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Like API POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
