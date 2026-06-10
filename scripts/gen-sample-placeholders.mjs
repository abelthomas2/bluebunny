// One-off generator for clearly-labeled gray placeholder assets for /samplereport.
// Build spec §4/§7/§12: 4:3 placeholders, exact filenames, swappable 1:1 when real assets land.
// Run: node scripts/gen-sample-placeholders.mjs   (then assets land in public/samplereport/)
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'samplereport');

const BG = '#D7DEE5';
const BORDER = '#B7C3CD';
const INK = '#5E6E7B';
const ACCENT = '#2978A5';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function placeholderSvg({ w, h, file, caption, time, badge }) {
  const cx = w / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="${BORDER}" stroke-width="3" stroke-dasharray="14 10" rx="14"/>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" text-anchor="middle">
    <text x="${cx}" y="${h * 0.34}" font-size="${Math.round(w * 0.018)}" letter-spacing="6" fill="${ACCENT}">${esc(badge || 'PLACEHOLDER')}</text>
    <text x="${cx}" y="${h * 0.5}" font-size="${Math.round(w * 0.05)}" font-weight="700" fill="${INK}">${esc(file)}</text>
    <text x="${cx}" y="${h * 0.62}" font-size="${Math.round(w * 0.026)}" fill="${INK}">${esc(caption)}</text>
    ${time ? `<text x="${cx}" y="${h * 0.71}" font-size="${Math.round(w * 0.024)}" fill="${INK}">${esc(time)}</text>` : ''}
  </g>
</svg>`;
}

// Album manifest (build spec §4) — keep filenames exactly.
const album = [
  ['af-entry.jpg', 'Entry & dining — as found', '11:05 AM'],
  ['af-living.jpg', 'Living area — as found', '11:06 AM'],
  ['af-kitchen.jpg', 'Kitchen — as found', '11:07 AM'],
  ['af-kitchensink.jpg', 'Sink & counters — as found', '11:07 AM'],
  ['af-bedroom.jpg', 'Master bedroom — as found', '11:08 AM'],
  ['af-bedstripped.jpg', 'Bed stripped, linens to wash', '11:09 AM'],
  ['af-bath.jpg', 'Bathroom — as found', '11:10 AM'],
  ['af-towels.jpg', 'Used towels & mat pulled', '11:11 AM'],
  ['flag-baseboard.jpg', 'Baseboard separation near tub apron', '11:13 AM', 'MAINTENANCE FLAG'],
  ['pt-entry.jpg', 'Entry & dining — guest-ready', '1:06 PM'],
  ['pt-living.jpg', 'Living area — guest-ready', '1:04 PM'],
  ['pt-kitchen.jpg', 'Kitchen — guest-ready', '1:05 PM'],
  ['pt-kitchensink.jpg', 'Sink & counters — guest-ready', '1:05 PM'],
  ['pt-bedroom.jpg', 'Master bedroom — guest-ready', '1:05 PM'],
  ['pt-beddetail.jpg', 'Fresh linens, bed detail', '1:06 PM'],
  ['pt-bath.jpg', 'Bathroom — guest-ready', '1:06 PM'],
  ['pt-towels.jpg', 'Towel set staged', '1:06 PM'],
  ['pt-consumables.jpg', 'Consumables placed', '1:07 PM'],
  ['pt-supplies.jpg', 'Supply closet restocked', '1:08 PM'],
  ['pt-thermostat.jpg', 'Thermostat set — 74°F, fan auto', '1:10 PM'],
  ['pt-lockup.jpg', 'Locked & departed', '1:12 PM'],
];

async function run() {
  await mkdir(outDir, { recursive: true });

  for (const [file, caption, time, badge] of album) {
    const svg = placeholderSvg({ w: 1200, h: 900, file, caption, time, badge });
    await sharp(Buffer.from(svg)).jpeg({ quality: 70 }).toFile(path.join(outDir, file));
  }

  // Video poster (16:9) — spokesman-in-kitchen frame, owner-supplied.
  await sharp(
    Buffer.from(
      placeholderSvg({ w: 1280, h: 720, file: 'video-poster.jpg', caption: 'Spokesman-in-kitchen frame', time: '', badge: 'VIDEO POSTER — PLACEHOLDER' }),
    ),
  )
    .jpeg({ quality: 72 })
    .toFile(path.join(outDir, 'video-poster.jpg'));

  // OG / unfurl image (1200×630), owner-supplied composite.
  await sharp(
    Buffer.from(
      placeholderSvg({ w: 1200, h: 630, file: 'Blue Bunny — Sample Report', caption: 'Full Turnover Photo Album', time: '', badge: 'OG IMAGE — PLACEHOLDER (1200×630)' }),
    ),
  )
    .jpeg({ quality: 78 })
    .toFile(path.join(outDir, 'og-sample-report.jpg'));

  console.log(`Generated ${album.length + 2} placeholder assets in public/samplereport/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
