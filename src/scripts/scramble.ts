const DIGIT_POOL = '0123456789';
const ALPHA_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const KEEP = new Set([' ', '·', ',', '.']);

type ScrambleElement = HTMLElement & { _scrambleRaf?: number };

/**
 * Shows random characters in place of `finalText`, settling left to right.
 * The element is hidden from assistive tech while it animates, so a screen
 * reader never announces the noise.
 */
export function scramble(
  el: HTMLElement,
  finalText: string,
  opts: { duration?: number; digitsOnly?: boolean } = {}
) {
  const duration = opts.duration ?? 520;
  const chars = finalText.split('');
  const start = performance.now();

  const target = el as ScrambleElement;
  if (target._scrambleRaf) cancelAnimationFrame(target._scrambleRaf);
  target.setAttribute('aria-hidden', 'true');

  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (KEEP.has(ch)) {
        out += ch;
        continue;
      }
      const threshold = (i / Math.max(chars.length - 1, 1)) * 0.6 + 0.18;
      if (t > threshold) {
        out += ch;
      } else {
        const pool = opts.digitsOnly || /\d/.test(ch) ? DIGIT_POOL : ALPHA_POOL;
        out += pool[Math.floor(Math.random() * pool.length)];
      }
    }
    target.textContent = out;
    if (t < 1) {
      target._scrambleRaf = requestAnimationFrame(step);
    } else {
      target.textContent = finalText;
      target._scrambleRaf = undefined;
      target.removeAttribute('aria-hidden');
    }
  };
  target._scrambleRaf = requestAnimationFrame(step);
}
