import puppeteer from 'puppeteer-core';

const CHROME =
  process.env.CHROME_PATH ||
  '/Users/abel/.cache/puppeteer/chrome/mac-148.0.7778.97/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const OUT = process.env.OUT_DIR;
const BASE = 'http://localhost:3000';
const width = Number(process.env.W || 1440);
const height = Number(process.env.H || 900);
const tag = process.env.TAG || 'desk';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: width < 700, hasTouch: width < 700 });
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 90000 });

// Scroll the whole page so lazy content + reveals fire, then return to top.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await sleep(1800);

const shots = JSON.parse(process.env.SHOTS || '[]');
for (const { name, sel, offset = 0 } of shots) {
  if (sel === 'top') {
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    await page.evaluate(
      (s, o) => {
        const el = document.querySelector(s);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + o);
      },
      sel,
      offset,
    );
  }
  await sleep(900);
  await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
  console.log('shot', name);
}

await browser.close();
