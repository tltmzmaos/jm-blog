/**
 * Converts raster images to WebP for the site, keeping the originals.
 *
 * Drop new screenshots into image-originals/<post-dir>/ and run this. Anything
 * without an up-to-date .webp in public/ is converted; originals are never
 * modified or deleted, and public/ ships only the WebP copies.
 *
 *   node scripts/optimize-images.mjs [--force]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'image-originals';
const OUT = 'public';
const MAX_WIDTH = 1600; // article column is 720px; this leaves room for 2x
const QUALITY = 82;
const force = process.argv.includes('--force');

function walk(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(p));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) found.push(p);
  }
  return found;
}

if (!fs.existsSync(SRC)) {
  console.error(`${SRC}/ not found — nothing to do.`);
  process.exit(0);
}

const sources = walk(SRC);
let converted = 0,
  skipped = 0,
  before = 0,
  after = 0;

for (const src of sources) {
  const dest = path
    .join(OUT, path.relative(SRC, src))
    .replace(/\.(png|jpe?g)$/i, '.webp');

  before += fs.statSync(src).size;

  if (!force && fs.existsSync(dest)) {
    if (fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) {
      after += fs.statSync(dest).size;
      skipped++;
      continue;
    }
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(dest);

  after += fs.statSync(dest).size;
  converted++;
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`converted ${converted}, up to date ${skipped}`);
console.log(
  `payload ${mb(before)}MB -> ${mb(after)}MB (${(100 - (after / before) * 100).toFixed(1)}% smaller)`
);
