import satori from 'satori';
import sharp from 'sharp';
import { formatEntryNumber } from './entryNumbers';
import { tagLabel } from './tags';

// Satori can't read the self-hosted woff2 files, so the OG card uses TTFs
// (URLs from fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600
// &family=IBM+Plex+Mono). These are the full fonts, "№" included.
const PLEX_SANS_400 =
  'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD6llzAA.ttf';
const PLEX_SANS_600 =
  'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDNF5zAA.ttf';
const PLEX_MONO_400 =
  'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n5ig.ttf';

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OG font download failed (${res.status}): ${url}`);
  }
  return res.arrayBuffer();
}

// Shared across every card in a build, so the fonts download once. A failed
// download is not cached, so the dev server can retry on the next request.
let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer, ArrayBuffer]> | undefined;
function loadFonts() {
  fontsPromise ??= Promise.all([
    fetchFont(PLEX_SANS_400),
    fetchFont(PLEX_SANS_600),
    fetchFont(PLEX_MONO_400),
  ]).catch((error: unknown) => {
    fontsPromise = undefined;
    throw error;
  });
  return fontsPromise;
}

export async function renderOgImage({
  title,
  tags = [],
  entry,
}: {
  title: string;
  tags?: string[];
  /** The post's entry number, shown above the title as on the post. */
  entry?: number;
}): Promise<Response> {
  const [regular, semibold, mono] = await loadFonts();

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
                entry !== undefined
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'IBM Plex Mono',
                          fontSize: '26px',
                          color: '#6b6b6b',
                          // Closer to the title it numbers than the gap
                          // between title and tags.
                          marginBottom: '-8px',
                        },
                        children: `№ ${formatEntryNumber(entry)}`,
                      },
                    }
                  : null,
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
                { type: 'span', props: { children: 'jongmin.me' } },
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
        { name: 'IBM Plex Mono', data: mono, weight: 400, style: 'normal' },
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
