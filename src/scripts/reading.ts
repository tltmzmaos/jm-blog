/**
 * Reading aids on a post page: the running header (components/
 * RunningHeader.astro) and the current entry of the contents sidebar.
 *
 * An IntersectionObserver on the title shows and hides the bar. A section
 * is being read once its heading has passed a line a quarter of the way
 * down the window; the headings' page offsets are measured once (and
 * again when the article changes size), so a scroll only compares
 * numbers and never reads layout. Without this script the bar stays
 * hidden and the contents list is a plain list of links.
 */

const runhead = document.querySelector<HTMLElement>('[data-runhead]');
const title = document.querySelector<HTMLElement>('.article-header h1');
const content = document.querySelector<HTMLElement>('.article-content');
const segments = [
  ...document.querySelectorAll<HTMLElement>('[data-runhead] .rail-seg'),
];
const tocLinks = [...document.querySelectorAll<HTMLElement>('.toc-link')];
const toc = document.querySelector<HTMLElement>('.toc-sidebar');
const glider = toc?.querySelector<HTMLElement>('.toc-glider');

// Where a highlighter stroke sits on a line of text, in em: the same
// --mark-top and --mark-height as every other stroke (BaseLayout).
const MARK_TOP = 0.66;
const MARK_HEIGHT = 0.44;
const LAYERS = 3;

/**
 * Puts the contents highlighter over entry `i`: one stroke per line of
 * its words, measured from the text itself. It glides there from the
 * previous entry (CSS transitions; none with reduced motion), and appears
 * in place the first time.
 */
const glide = (i: number) => {
  if (!toc || !glider) return;
  const text = tocLinks[i]?.querySelector<HTMLElement>('.toc-text');
  // The sidebar is hidden below 1240px; a fixed box has no offsetParent,
  // so ask for its boxes instead.
  if (!text || toc.getClientRects().length === 0) {
    glider.classList.remove('is-on');
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(text);
  const box = toc.getBoundingClientRect();
  const fontSize = parseFloat(getComputedStyle(text).fontSize);
  // One rect per line; merge any pieces of the same line.
  const lines: { x: number; y: number; w: number }[] = [];
  for (const r of range.getClientRects()) {
    const y = r.top - box.top + toc.scrollTop + MARK_TOP * fontSize;
    const x = r.left - box.left;
    const line = lines.find((l) => Math.abs(l.y - y) < 2);
    if (line) {
      const right = Math.max(line.x + line.w, x + r.width);
      line.x = Math.min(line.x, x);
      line.w = right - line.x;
    } else lines.push({ x, y, w: r.width });
  }
  if (lines.length === 0) return;
  const h = MARK_HEIGHT * fontSize;
  const left = Math.min(...lines.map((l) => l.x));
  const top = lines[0].y;
  const width = Math.max(...lines.map((l) => l.x + l.w)) - left;
  const height = lines[lines.length - 1].y + h - top;
  // Three layers always, so the transition can blend them: lines past
  // the third share its stroke, missing ones are empty at the last line.
  const layers = Array.from({ length: LAYERS }, (_, k) => {
    const l = lines[Math.min(k, lines.length - 1)];
    const w = k < lines.length ? l.w : 0;
    return { pos: `${l.x - left}px ${l.y - top}px`, size: `${w}px ${h}px` };
  });

  const first = !glider.classList.contains('is-on');
  glider.classList.toggle('is-gliding', !first);
  glider.style.transform = `translate(${left}px, ${top}px)`;
  glider.style.width = `${width}px`;
  glider.style.height = `${height}px`;
  glider.style.backgroundPosition = layers.map((l) => l.pos).join(', ');
  glider.style.backgroundSize = layers.map((l) => l.size).join(', ');
  glider.classList.add('is-on');
};

const headings = segments
  .map((seg) => document.getElementById(seg.dataset.slug ?? ''))
  .filter((h): h is HTMLElement => h !== null);

if (runhead && title && content && headings.length === segments.length) {
  runhead.hidden = false;
  const sectionN = runhead.querySelector<HTMLElement>('.runhead-n');
  const sectionText = runhead.querySelector<HTMLElement>('.runhead-text');

  // The bar is shown while the title is above the top of the window.
  new IntersectionObserver(([entry]) => {
    const gone = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    runhead.classList.toggle('is-shown', gone);
  }).observe(title);

  // Page offsets of each section's start and end, for the rail's segment
  // lengths and the reader's progress through a section.
  let starts: number[] = [];
  let ends: number[] = [];
  const measure = () => {
    const end = content.getBoundingClientRect().bottom + scrollY;
    starts = headings.map((h) => h.getBoundingClientRect().top + scrollY);
    ends = starts.map((_, i) => starts[i + 1] ?? end);
    segments.forEach((seg, i) => {
      seg.style.flexGrow = String(Math.max(1, ends[i] - starts[i]));
    });
  };

  const line = () => Math.max(96, Math.round(innerHeight * 0.25));

  let current = -2;

  const show = (i: number) => {
    current = i;
    segments.forEach((seg, k) => {
      seg.classList.toggle('done', k < i);
      seg.classList.toggle('current', k === i);
    });
    const seg = segments[i];
    if (sectionN) sectionN.textContent = seg?.dataset.n ?? '';
    if (sectionText) sectionText.textContent = seg?.dataset.text ?? '';
    glide(i);
    tocLinks.forEach((link, k) => {
      link.classList.toggle('active', k === i);
      if (k === i) {
        // Keep the current entry in view in a long sidebar list.
        const box = link.closest<HTMLElement>('.toc-sidebar');
        if (box) {
          const a = link.getBoundingClientRect();
          const b = box.getBoundingClientRect();
          if (a.top < b.top || a.bottom > b.bottom) {
            link.scrollIntoView({ block: 'nearest' });
          }
        }
      }
    });
    document.dispatchEvent(
      new CustomEvent('reading:section', { detail: { index: i } })
    );
  };

  const update = () => {
    const y = scrollY + line();
    let i = -1;
    while (i + 1 < starts.length && starts[i + 1] <= y) i++;
    // At the very end the last short sections never reach the line: the
    // last heading in the window is the one being read then.
    const atEnd =
      innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    if (atEnd) {
      while (i + 1 < starts.length && starts[i + 1] < scrollY + innerHeight) {
        i++;
      }
    }
    if (i !== current) show(i);
    const seg = segments[i];
    if (seg) {
      const progress = Math.min(
        1,
        Math.max(0, (y - starts[i]) / (ends[i] - starts[i]))
      );
      seg.style.setProperty('--progress', atEnd ? '1' : progress.toFixed(3));
    }
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };

  measure();
  update();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    measure();
    onScroll();
    glide(current);
  });
  // Plex arriving after first paint rewraps the contents entries.
  void document.fonts.ready.then(() => glide(current));
  // Images, math and late fonts change section lengths after first paint.
  new ResizeObserver(() => {
    measure();
    onScroll();
  }).observe(content);
}

export {};
