// Captures the current fwbbowl.com site for reference:
//   - full-page screenshots at desktop (1440px) and mobile (375px) widths
//   - readable tiles of each full-page shot
//   - 2x close-ups of every content image (most prices live inside images)
//   - a text / link / image inventory per page, plus any linked PDFs
//
// Reference only. Nothing in reference/screenshots or reference/raw goes into
// the build, and both folders are gitignored because they hold the business's
// own photos and graphics.
//
// Usage: npm run capture          (SITE=https://example.test npm run capture to point elsewhere)

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = (process.env.SITE ?? 'https://www.fwbbowl.com').replace(/\/$/, '');
const ROOT = path.resolve(import.meta.dirname, '..', 'reference');
const SHOTS = path.join(ROOT, 'screenshots');
const TILES = path.join(SHOTS, 'tiles');
const DETAIL = path.join(SHOTS, 'detail');
const RAW = path.join(ROOT, 'raw');
const SEED_PATHS = ['/', '/specials', '/menu', '/parties', '/bowling-community'];
const MAX_PAGES = 20;

const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, tileHeight: 1600 },
  mobile: {
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    tileHeight: 812,
  },
};

const slugFor = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase());

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Scroll the whole page so lazy-loaded images and scroll animations fire.
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 15000 })
    .catch(() => console.warn('  some images never finished loading'));
  await page.waitForTimeout(800);
}

async function open(context, url) {
  const page = await context.newPage();
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await settle(page);
  return { page, status: response?.status() ?? 0 };
}

async function tiles(page, slug, view, tileHeight) {
  const { width, height } = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
  }));
  let n = 0;
  for (let y = 0; y < height; y += tileHeight) {
    n += 1;
    await page.screenshot({
      path: path.join(TILES, `${slug}--${view}--${String(n).padStart(2, '0')}.png`),
      fullPage: true,
      clip: { x: 0, y, width, height: Math.min(tileHeight, height - y) },
    });
  }
  return n;
}

function inventory(page) {
  return page.evaluate(() => {
    const abs = (u) => {
      try {
        return new URL(u, location.href).href;
      } catch {
        return u;
      }
    };
    const shown = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const backgrounds = [...document.querySelectorAll('body *')]
      .map((el) => ({ el, bg: getComputedStyle(el).backgroundImage }))
      .filter(({ bg }) => bg && bg.includes('url('))
      .map(({ el, bg }) => ({
        urls: [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)].map((m) => abs(m[1])),
        box: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)],
        text: el.innerText?.trim().slice(0, 200) ?? '',
      }));
    return {
      url: location.href,
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content ?? null,
      og: Object.fromEntries(
        [...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.content]),
      ),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .filter(shown)
        .map((h) => `${h.tagName}: ${h.innerText.trim()}`),
      text: document.body.innerText,
      links: [...document.querySelectorAll('a[href]')].map((a) => ({
        text: (a.innerText || a.getAttribute('aria-label') || '').trim(),
        href: abs(a.getAttribute('href')),
      })),
      images: [...document.querySelectorAll('img')].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.getAttribute('alt'),
        natural: [img.naturalWidth, img.naturalHeight],
        shown: shown(img),
      })),
      backgrounds,
      iframes: [...document.querySelectorAll('iframe')].map((f) => f.src),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
    };
  });
}

// Close-ups of every image big enough to hold text, at 2x, so prices are legible.
async function closeUps(page, slug) {
  const count = await page.evaluate(() => {
    let i = 0;
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 150 || r.height < 100) continue;
      const isImg = el.tagName === 'IMG';
      const hasBg = getComputedStyle(el).backgroundImage.includes('url(');
      if (!isImg && !hasBg) continue;
      el.setAttribute('data-capture-idx', String(i++));
    }
    return i;
  });
  const saved = [];
  for (let i = 0; i < count; i += 1) {
    const el = page.locator(`[data-capture-idx="${i}"]`);
    const file = `${slug}--img-${String(i + 1).padStart(2, '0')}.png`;
    try {
      await el.scrollIntoViewIfNeeded({ timeout: 5000 });
      await page.waitForTimeout(250);
      await el.screenshot({ path: path.join(DETAIL, file), timeout: 15000 });
      const meta = await el.evaluate((n) => ({
        tag: n.tagName,
        src: n.currentSrc || n.src || getComputedStyle(n).backgroundImage,
        alt: n.getAttribute('alt'),
        box: [Math.round(n.getBoundingClientRect().width), Math.round(n.getBoundingClientRect().height)],
      }));
      saved.push({ file, ...meta });
    } catch (err) {
      saved.push({ file, error: err.message.split('\n')[0] });
    }
  }
  return saved;
}

async function main() {
  for (const dir of [SHOTS, TILES, DETAIL, RAW]) await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  const contexts = Object.fromEntries(
    await Promise.all(
      Object.entries(VIEWS).map(async ([name, { tileHeight, ...opts }]) => [name, await browser.newContext(opts)]),
    ),
  );
  const detail = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

  const queue = [...SEED_PATHS];
  const seen = new Set();
  const pdfs = new Set();
  const summary = [];

  while (queue.length && seen.size < MAX_PAGES) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    const slug = slugFor(p);
    const url = SITE + p;
    console.log(`\n${url}`);
    const row = { path: p, slug };

    for (const [view, { tileHeight }] of Object.entries(VIEWS)) {
      try {
        const { page, status } = await open(contexts[view], url);
        row[`${view}Status`] = status;
        await page.screenshot({ path: path.join(SHOTS, `${slug}--${view}.png`), fullPage: true });
        row[`${view}Tiles`] = await tiles(page, slug, view, tileHeight);
        if (view === 'desktop') {
          const inv = await inventory(page);
          await writeFile(path.join(RAW, `${slug}.json`), JSON.stringify(inv, null, 2));
          await writeFile(path.join(RAW, `${slug}.html`), await page.content());
          await writeFile(path.join(RAW, `${slug}.txt`), inv.text);
          for (const { href } of inv.links) {
            const u = new URL(href);
            if (u.origin !== new URL(SITE).origin) continue;
            if (/\.pdf$/i.test(u.pathname)) pdfs.add(u.href);
            else if (!/\.(jpe?g|png|gif|webp|svg|zip)$/i.test(u.pathname)) queue.push(u.pathname.replace(/\/$/, '') || '/');
          }
        }
        console.log(`  ${view}: HTTP ${status}, ${row[`${view}Tiles`]} tiles`);
        await page.close();
      } catch (err) {
        row[`${view}Error`] = err.message.split('\n')[0];
        console.warn(`  ${view} failed: ${row[`${view}Error`]}`);
      }
    }

    try {
      const { page } = await open(detail, url);
      row.closeUps = await closeUps(page, slug);
      console.log(`  close-ups: ${row.closeUps.length}`);
      await page.close();
    } catch (err) {
      row.closeUpError = err.message.split('\n')[0];
    }
    summary.push(row);
  }

  for (const href of pdfs) {
    try {
      const res = await contexts.desktop.request.get(href);
      const file = path.join(RAW, path.basename(new URL(href).pathname));
      await writeFile(file, await res.body());
      console.log(`pdf saved: ${file}`);
    } catch (err) {
      console.warn(`pdf failed: ${href}: ${err.message}`);
    }
  }

  await writeFile(path.join(RAW, 'capture-summary.json'), JSON.stringify({ site: SITE, at: new Date().toISOString(), pages: summary, pdfs: [...pdfs] }, null, 2));
  await browser.close();
  console.log(`\nDone. ${summary.length} pages captured into ${path.relative(process.cwd(), ROOT)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
