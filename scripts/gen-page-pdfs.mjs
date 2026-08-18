// Generates full-page PDF "views" of the two public pages with every collapsible
// / carousel / tabbed section expanded so all content is visible at once.
//
//   node scripts/gen-page-pdfs.mjs
//
// Requires the production server (next start) running on BASE_URL.
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const CHROME =
  process.env.CHROME_PATH ||
  '/Users/abel/.cache/puppeteer/chrome/mac-148.0.7778.97/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4123';
const VIEWPORT_WIDTH = 1280;

const TARGETS = [
  { route: '/', out: 'homepage.pdf' },
  { route: '/samplereport', out: 'samplereport.pdf' },
];

// Runs in the browser. Drives every state-gated component so all of its content
// is rendered into the DOM at once, then neutralizes fixed headers and forces
// lazy images to load.
async function expandEverything() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- 1. FAQ accordion: reveal hidden questions, force every panel open ---
  const showMore = [...document.querySelectorAll('button')].find((b) =>
    /more question/i.test(b.textContent || ''),
  );
  if (showMore) {
    showMore.click();
    await sleep(150);
  }
  // The collapse wrapper is the <div> immediately after each accordion <button>.
  const faqCss = document.createElement('style');
  faqCss.textContent =
    'button[aria-expanded] + div{grid-template-rows:1fr !important;opacity:1 !important;}';
  document.head.appendChild(faqCss);

  // --- 2. Process carousel (homepage): stack all steps vertically ---
  const dots = [...document.querySelectorAll('button[aria-label^="Go to step"]')];
  if (dots.length) {
    const root = dots[0].closest('.max-w-4xl');
    const card = root.querySelector('.rounded-2xl');
    const contentSel = '.px-10';
    const snapshots = [];
    for (const dot of dots) {
      dot.click();
      await sleep(50);
      const content = card.querySelector(contentSel) || card;
      snapshots.push(content.innerHTML);
    }
    const stack = document.createElement('div');
    stack.className = 'mt-8 md:mt-12 mx-auto max-w-4xl px-4 flex flex-col gap-4';
    for (const html of snapshots) {
      const cardEl = document.createElement('div');
      cardEl.className = 'rounded-2xl border border-[#E2EEF5] bg-white shadow-sm';
      const inner = document.createElement('div');
      inner.className = 'px-10 py-7';
      inner.innerHTML = html;
      cardEl.appendChild(inner);
      stack.appendChild(cardEl);
    }
    root.replaceWith(stack);
  }

  // --- 3. Photo album (sample report): stack every room block vertically ---
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  if (tabs.length) {
    const tablist = tabs[0].closest('[role="tablist"]');
    const albumRoot = tablist.parentElement;
    const blockContainer = albumRoot.querySelector('.mt-2');
    const snapshots = [];
    for (const tab of tabs) {
      tab.click();
      await sleep(80);
      const block = blockContainer.querySelector('article');
      if (block) snapshots.push(block.outerHTML);
    }
    tablist.style.display = 'none';
    blockContainer.className = 'mt-4 flex flex-col gap-4';
    blockContainer.innerHTML = '';
    for (const html of snapshots) {
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      if (wrap.firstElementChild) blockContainer.appendChild(wrap.firstElementChild);
    }
  }

  // --- 4. Neutralize fixed headers so they appear once at the top ---
  for (const el of document.querySelectorAll('header, nav')) {
    if (getComputedStyle(el).position === 'fixed') {
      el.style.position = 'absolute';
      el.style.top = '0';
    }
  }

  // --- 4b. Pin viewport-height (dvh/vh) sections to their on-screen height.
  // During PDF layout Chrome uses the (huge) page height as the viewport, so
  // `min-h-dvh` / `min-h-screen` would balloon these to fill the whole page. ---
  for (const el of document.querySelectorAll('#pm-hero')) {
    el.style.minHeight = el.offsetHeight + 'px';
  }

  // --- 5. Force every image to load eagerly ---
  for (const img of document.querySelectorAll('img')) {
    img.loading = 'eager';
    if (img.getAttribute('decoding')) img.decoding = 'sync';
  }
}

// Scrolls the whole page (mounting any lazy/IntersectionObserver components such
// as the embedded PDF viewers) and waits for every image to finish decoding.
async function scrollAndLoadImages(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const total = document.body.scrollHeight;
    for (let y = 0; y < total; y += 700) {
      window.scrollTo(0, y);
      await sleep(70);
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
              setTimeout(res, 5000);
            }),
      ),
    );
  });
}

// Waits for every embedded react-pdf page canvas to have actually painted
// (non-blank). Resolves immediately on pages that have no embedded viewer.
async function waitForPdfCanvases(page) {
  await page
    .waitForFunction(
      () => {
        const cs = [...document.querySelectorAll('.react-pdf__Page__canvas')];
        if (cs.length === 0) return true;
        return cs.every((c) => {
          if (!(c.width > 0 && c.height > 0)) return false;
          try {
            // Downscale the whole page into a tiny offscreen canvas so we detect
            // painted content anywhere on the page, not just one corner.
            const off = document.createElement('canvas');
            off.width = 48;
            off.height = 62;
            const octx = off.getContext('2d');
            octx.drawImage(c, 0, 0, off.width, off.height);
            const d = octx.getImageData(0, 0, off.width, off.height).data;
            let nonWhite = 0;
            for (let i = 0; i < d.length; i += 4) {
              if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) nonWhite++;
            }
            return nonWhite > 15;
          } catch {
            return true; // can't read (shouldn't happen same-origin) — don't block
          }
        });
      },
      { timeout: 25000 },
    )
    .catch(() => console.log('  (pdf canvases not confirmed; continuing)'));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  try {
    for (const { route, out } of TARGETS) {
      const page = await browser.newPage();
      await page.setViewport({ width: VIEWPORT_WIDTH, height: 1200, deviceScaleFactor: 2 });
      const url = `${BASE_URL}${route}`;
      console.log(`→ ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

      // Let dynamic imports (carousels, PDF viewers) mount.
      await new Promise((r) => setTimeout(r, 1500));

      await page.evaluate(expandEverything);
      await new Promise((r) => setTimeout(r, 600));

      // Scroll first so lazy IntersectionObserver components (the embedded PDF
      // viewers) mount, then wait for their canvases to actually paint.
      await scrollAndLoadImages(page);
      await waitForPdfCanvases(page);
      // A second pass catches lazy images revealed by any post-mount reflow.
      await scrollAndLoadImages(page);
      await new Promise((r) => setTimeout(r, 600));

      await page.emulateMediaType('screen');

      const fullHeight = await page.evaluate(() =>
        Math.ceil(
          Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
          ),
        ),
      );
      console.log(`  full height: ${fullHeight}px`);

      const outPath = path.join(PUBLIC_DIR, out);
      await page.pdf({
        path: outPath,
        printBackground: true,
        width: `${VIEWPORT_WIDTH}px`,
        height: `${fullHeight}px`,
        pageRanges: '1',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      console.log(`  ✓ wrote ${outPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
