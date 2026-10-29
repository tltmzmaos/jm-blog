/**
 * Image zoom on a post page. An image drawn smaller than its file opens
 * in a native modal <dialog>, as large as the window allows (never past
 * its own size), with its alt text under it. Where same-document view
 * transitions exist and motion is welcome, the image grows out of its
 * place in the text and shrinks back into it.
 *
 * Opens on a click, or Enter or Space on the focused image. Esc, a click
 * anywhere or the close button closes it, and focus goes back to the
 * image. Images shown at full size, or that the window can't show much
 * larger (a phone held upright), are left alone.
 */

const images = [
  ...document.querySelectorAll<HTMLImageElement>('.article-content img'),
];

const NAME = 'zoom-image';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

let dialog: HTMLDialogElement | undefined;
let big: HTMLImageElement;
let caption: HTMLElement;
let zoomedFrom: HTMLImageElement | undefined;

const naturalSize = (img: HTMLImageElement) => ({
  w: img.naturalWidth || Number(img.getAttribute('width')) || 0,
  h: img.naturalHeight || Number(img.getAttribute('height')) || 0,
});

// The zoomed size: as large as fits in the window with a margin (and room
// for the caption), never larger than the file.
const fitted = (img: HTMLImageElement) => {
  const { w, h } = naturalSize(img);
  const margin = innerWidth < 640 ? 32 : 64;
  const scale = Math.min(
    1,
    (innerWidth - margin) / w,
    (innerHeight - margin - (img.alt ? 64 : 0)) / h
  );
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
};

// Only an image the dialog would show clearly larger has more to show.
const mark = (img: HTMLImageElement) => {
  const zoomable =
    img.clientWidth > 0 && fitted(img).w > img.clientWidth * 1.15;
  img.classList.toggle('is-zoomable', zoomable);
  if (zoomable) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
  } else {
    img.removeAttribute('tabindex');
    img.removeAttribute('role');
    img.removeAttribute('aria-haspopup');
    img.removeAttribute('aria-label');
  }
};

const build = () => {
  dialog = document.createElement('dialog');
  dialog.className = 'zoom';
  dialog.setAttribute('aria-labelledby', 'zoom-caption');
  dialog.innerHTML =
    '<figure class="zoom-figure"><img class="zoom-img" alt="" />' +
    '<figcaption class="zoom-caption" id="zoom-caption"></figcaption></figure>' +
    '<button type="button" class="zoom-close">Close</button>';
  big = dialog.querySelector('.zoom-img') as HTMLImageElement;
  caption = dialog.querySelector('.zoom-caption') as HTMLElement;
  document.body.append(dialog);

  dialog.addEventListener('click', () => closeZoom());
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeZoom();
  });
};

// Runs a DOM change inside a view transition where that is possible, with
// `from` named before and `to` named after, so one morphs into the other.
const morph = async (
  from: HTMLElement,
  to: HTMLElement,
  change: () => void
) => {
  if (!('startViewTransition' in document) || reduce.matches) {
    change();
    return;
  }
  from.style.viewTransitionName = NAME;
  const t = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    to.style.viewTransitionName = NAME;
    change();
  });
  try {
    await t.finished;
  } catch {
    // A skipped transition still made the change.
  } finally {
    to.style.viewTransitionName = '';
  }
};

const openZoom = (img: HTMLImageElement) => {
  if (!dialog) build();
  if (!dialog || dialog.open) return;
  zoomedFrom = img;
  const { w, h } = fitted(img);
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  big.width = w;
  big.height = h;
  caption.textContent = img.alt;
  caption.hidden = !img.alt;
  void morph(img, big, () => dialog?.showModal());
};

const closeZoom = () => {
  if (!dialog?.open) return;
  const img = zoomedFrom;
  void morph(big, img ?? big, () => {
    dialog?.close();
    img?.focus({ preventScroll: true });
  });
};

if (images.length > 0) {
  const markAll = () => images.forEach(mark);
  images.forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => mark(img));
    img.addEventListener('click', () => {
      if (img.classList.contains('is-zoomable')) openZoom(img);
    });
    img.addEventListener('keydown', (e) => {
      if (!img.classList.contains('is-zoomable')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openZoom(img);
      }
    });
  });
  markAll();
  let timer: ReturnType<typeof setTimeout> | undefined;
  addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(markAll, 150);
  });
}

export {};
