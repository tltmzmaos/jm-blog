import { readFileSync } from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { tagLabel } from './tags';

// Satori can't read the self-hosted woff2 files, so the OG card uses TTFs
// (URLs from fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600).
const PLEX_SANS_400 =
  'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD6llzAA.ttf';
const PLEX_SANS_600 =
  'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDNF5zAA.ttf';

// The JL mark, the same file as the favicon, for the card's footer.
const MARK = `data:image/svg+xml;base64,${readFileSync(
  path.join(process.cwd(), 'public', 'favicon.svg')
).toString('base64')}`;

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OG font download failed (${res.status}): ${url}`);
  }
  return res.arrayBuffer();
}

// Shared across every card in a build, so the fonts download once. A failed
// download is not cached, so the dev server can retry on the next request.
let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer]> | undefined;
function loadFonts() {
  fontsPromise ??= Promise.all([
    fetchFont(PLEX_SANS_400),
    fetchFont(PLEX_SANS_600),
  ]).catch((error: unknown) => {
    fontsPromise = undefined;
    throw error;
  });
  return fontsPromise;
}

export async function renderOgImage({
  title,
  tags = [],
}: {
  title: string;
  tags?: string[];
}): Promise<Response> {
  const [regular, semibold] = await loadFonts();

  // Same look as the site: white page, near-black Plex Sans title, and the
  // tags and footer in the muted grey. No color accents, no chips.
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          // Without this, newer satori sizes the root as content-box and the
          // padding pushes the footer off the 630px canvas.
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          padding: '72px',
          backgroundColor: '#ffffff',
          color: '#171717',
          fontFamily: 'IBM Plex Sans, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '56px',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: '-1px',
                      color: '#171717',
                      maxWidth: '1000px',
                    },
                    children: title,
                  },
                },
                tags.length > 0
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          gap: '20px',
                          fontSize: '26px',
                          color: '#6b6b6b',
                        },
                        children: tags.slice(0, 3).map((tag: string) => ({
                          type: 'span',
                          props: { children: `#${tagLabel(tag)}` },
                        })),
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #e5e5e5',
                paddingTop: '28px',
                fontSize: '24px',
                color: '#6b6b6b',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    },
                    children: [
                      {
                        type: 'img',
                        props: { src: MARK, width: 40, height: 40 },
                      },
                      { type: 'span', props: { children: 'jongmin.me' } },
                    ],
                  },
                },
                { type: 'span', props: { children: 'Jongmin Lee' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'IBM Plex Sans', data: regular, weight: 400, style: 'normal' },
        { name: 'IBM Plex Sans', data: semibold, weight: 600, style: 'normal' },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
