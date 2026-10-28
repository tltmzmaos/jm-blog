import path from 'node:path';
import sharp from 'sharp';

/**
 * Gives Markdown images in public/ their real width and height and lazy
 * loading, so the browser reserves space and skips offscreen downloads.
 * A missing local file fails the build, the same as a missing hero image.
 */
export default function rehypeImageAttrs() {
  return async (tree) => {
    const images = [];
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') images.push(node);
      node.children?.forEach(walk);
    };
    walk(tree);

    await Promise.all(
      images.map(async (img) => {
        const props = (img.properties ??= {});
        props.loading ??= 'lazy';
        props.decoding ??= 'async';

        const src = typeof props.src === 'string' ? props.src : '';
        if (!src.startsWith('/') || props.width || props.height) return;

        const file = path.join(process.cwd(), 'public', decodeURI(src));
        const { width, height } = await sharp(file).metadata();
        if (width && height) {
          props.width = width;
          props.height = height;
        }
      })
    );
  };
}
