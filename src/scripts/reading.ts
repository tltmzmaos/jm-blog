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
  });
  // Images, math and late fonts change section lengths after first paint.
  new ResizeObserver(() => {
    measure();
    onScroll();
  }).observe(content);
}
