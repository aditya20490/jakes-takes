// Runs automatically before every build (see "prebuild" in package.json).
// It looks inside public/photos and writes data/photos.generated.json,
// so adding a photo is just uploading the file. There is no list to maintain.
// Photos show in alphabetical order, so name them 01-..., 02-..., 03-... to control the order.
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const photosDir = join(root, 'public', 'photos');
const outFile = join(root, 'data', 'photos.generated.json');
const OK = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

let files = [];
try {
  if (existsSync(photosDir)) {
    files = readdirSync(photosDir)
      .filter((f) => !f.startsWith('.') && OK.has(extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  }
} catch {
  files = [];
}

const photos = files.map((f) => ({ src: '/photos/' + encodeURIComponent(f) }));

// This script must never break the build, so any problem just logs a message.
try {
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(photos, null, 2) + '\n');
  console.log(`photos: ${photos.length} found in public/photos`);
} catch (e) {
  console.log('photos: could not write the list:', e.message);
}
