import satori from 'satori';
import sharp from 'sharp';

// Satori can't read the self-hosted woff2 files, so the OG card uses TTFs.
const INTER_400 =
  'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf';
const INTER_700 =
  'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf';

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
    fetchFont(INTER_400),
    fetchFont(INTER_700),
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
  const [regular, bold] = await loadFonts();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          // Satori 0.63 adds padding to a percentage height unless told otherwise,
          // which pushes the footer below the 630px canvas.
          boxSizing: 'border-box',
          padding: '60px',
          backgroundColor: '#181715',
          color: '#e6e2dc',
          fontFamily: 'Inter, sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '42px',
                      fontWeight: '700',
                      lineHeight: '1.3',
                      color: '#f5f1eb',
                      maxWidth: '900px',
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
                          gap: '8px',
                          marginTop: '8px',
                        },
                        children: tags.slice(0, 3).map((tag: string) => ({
                          type: 'span',
                          props: {
                            style: {
                              fontSize: '18px',
                              padding: '4px 12px',
                              backgroundColor: 'rgba(220, 141, 105, 0.18)',
                              color: '#dc8d69',
                              borderRadius: '6px',
                            },
                            children: tag,
                          },
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
                borderTop: '1px solid #34312d',
                paddingTop: '24px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '22px', color: '#9d958b' },
                    children: 'jongmin.me',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '22px', color: '#9d958b' },
                    children: 'Jongmin Lee',
                  },
                },
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
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
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
