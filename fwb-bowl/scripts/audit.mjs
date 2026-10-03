// Accessibility, performance and layout audit for every page.
//
//   npm run audit
//
// 1. Builds the LAUNCH version (preview mode off) into .audit-dist/
// 2. Serves it locally and runs, for every page:
//    - axe-core (WCAG 2.0/2.1/2.2 A + AA rules) at 375, 768 and 1440 px
//    - Lighthouse (mobile and desktop): performance, accessibility, best practices, SEO
//    - reflow at 320 px, 200% text size, keyboard focus walk, tap-target sizes
//    - screenshots at 375, 768 and 1440 px
// 3. Writes everything to reports/ with a summary in reports/README.md
//
// Uses the Playwright Chromium already on the machine for both tools.

import { spawn, execSync } from 'node:child_process';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'reports');
const PORT = 4399;
const BASE = `http://127.0.0.1:${PORT}`;
const PAGES = [
  ['home', '/'],
  ['prices', '/prices/'],
  ['specials', '/specials/'],
  ['parties', '/parties/'],
  ['leagues', '/leagues/'],
  ['accessibility', '/accessibility/'],
  ['privacy', '/privacy/'],
  ['party-thanks', '/parties/thanks/'],
  ['not-found', '/404/'],
];
const WIDTHS = [375, 768, 1440];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const chromePath = chromium.executablePath();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function serve() {
  // Astro only allows one preview server at a time, so stop any leftover one first.
  try {
    execSync('npx astro preview stop', { cwd: root, stdio: 'ignore' });
  } catch {}
  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: root,
    env: { ...process.env, FWB_OUT_DIR: './.audit-dist' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return server;
    } catch {}
    await sleep(500);
  }
  server.kill();
  throw new Error('preview server did not start');
}

async function axeAll(browser) {
  const results = [];
  for (const [name, url] of PAGES) {
    for (const width of WIDTHS) {
      // axe needs a page that belongs to an explicit browser context
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      results.push({
        page: name,
        width,
        violations: r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => n.target.join(' ')),
        })),
        incomplete: r.incomplete.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
        passes: r.passes.length,
      });
      await context.close();
    }
  }
  return results;
}

async function layoutChecks(browser) {
  const rows = [];
  for (const [name, url] of PAGES) {
    const row = { page: name };

    // WCAG 1.4.10 Reflow: no sideways scrolling at 320 CSS px
    let page = await browser.newPage({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    row.reflow320 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    // WCAG 1.4.4 Resize text: 200% text size at 1280 px, nothing clipped sideways
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await sleep(150);
    row.text200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.close();

    // Browser zoom 200% at 1280 px wide is a 640 px CSS viewport
    page = await browser.newPage({ viewport: { width: 640, height: 400 }, reducedMotion: 'reduce' });
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    row.zoom200 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.close();

    // Keyboard walk + focus visibility + not hidden under the sticky header (WCAG 2.4.7, 2.4.11)
    page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    const stops = [];
    const problems = [];
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(async () => {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const label = (
          el.getAttribute('aria-label') ||
          el.textContent ||
          el.querySelector('img')?.getAttribute('alt') ||
          el.getAttribute('name') ||
          el.tagName
        )
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 50);
        const visibleRing =
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none');
        // Obscured = whatever is painted at the element's center isn't the element (e.g. the sticky header).
        const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
        const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
        const top = document.elementFromPoint(x, y);
        const obscured = !!top && !el.contains(top) && !top.contains(el) && !!top.closest('.site-header');
        return {
          label: `${el.tagName.toLowerCase()}: ${label}`,
          visibleRing,
          obscured,
          key: el.outerHTML.slice(0, 120),
        };
      });
      if (!info) continue;
      if (stops.length && stops[0].key === info.key) break; // wrapped around
      stops.push(info);
      if (!info.visibleRing) problems.push(`no visible focus: ${info.label}`);
      if (info.obscured) problems.push(`hidden under sticky header: ${info.label}`);
    }
    row.tabStops = stops.length;
    row.focusProblems = problems;
    row.firstStops = stops.slice(0, 4).map((s) => s.label);

    // WCAG 2.5.8 Target size (minimum 24×24, inline text links excepted)
    row.targets = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a[href], button, input, select, textarea, summary')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      });
      const inline = (el) => el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, td, span');
      const small = els
        .filter((el) => !inline(el) && el.type !== 'hidden')
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width < 24 || r.height < 24;
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('name') || '').trim().slice(0, 30)}"`);
      const big = els.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44;
      }).length;
      return { total: els.length, under24: small, atLeast44: big };
    });
    await page.close();
    rows.push(row);
  }
  return rows;
}

async function screenshots(browser) {
  const dir = path.join(out, 'screenshots');
  await mkdir(dir, { recursive: true });
  for (const [name, url] of PAGES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(dir, `${name}-${width}.jpg`), fullPage: true, type: 'jpeg', quality: 78 });
      await page.close();
    }
  }
}

async function lighthouseAll() {
  const dir = path.join(out, 'lighthouse');
  await mkdir(dir, { recursive: true });
  const scores = [];
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });
  try {
    for (const [name, url] of PAGES.filter(([n]) => n !== 'not-found' && n !== 'party-thanks')) {
      for (const formFactor of ['mobile', 'desktop']) {
        const config = formFactor === 'desktop' ? desktopConfig : undefined;
        const result = await lighthouse(
          BASE + url,
          { port: chrome.port, output: 'html', logLevel: 'error' },
          config,
        );
        await writeFile(path.join(dir, `${name}-${formFactor}.html`), result.report);
        const c = result.lhr.categories;
        scores.push({
          page: name,
          formFactor,
          performance: Math.round(c.performance.score * 100),
          accessibility: Math.round(c.accessibility.score * 100),
          bestPractices: Math.round(c['best-practices'].score * 100),
          seo: Math.round(c.seo.score * 100),
          lcp: result.lhr.audits['largest-contentful-paint'].displayValue,
          cls: result.lhr.audits['cumulative-layout-shift'].displayValue,
          failed: Object.values(result.lhr.audits)
            .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary')
            .map((a) => a.id),
        });
        console.log(`  lighthouse ${name} ${formFactor}: ${JSON.stringify(scores.at(-1))}`);
      }
    }
  } finally {
    await chrome.kill();
  }
  return scores;
}

function summary(axe, layout, lh) {
  const date = new Date().toISOString().slice(0, 10);
  const totalViolations = axe.reduce((n, r) => n + r.violations.length, 0);
  const lines = [
    '# Audit reports',
    '',
    `Generated ${date} by \`npm run audit\` against the **launch build** (preview mode off), served locally.`,
    'Chromium from Playwright, axe-core via @axe-core/playwright, Lighthouse 13.',
    '',
    '## axe-core (WCAG 2.0, 2.1, 2.2 A + AA, plus best practices)',
    '',
    `Every page at 375, 768 and 1440 px. **${totalViolations} violations** across ${axe.length} page/width runs.`,
    '',
    '| Page | Width | Violations | Needs review (manual) | Rules passed |',
    '|---|---|---|---|---|',
    ...axe.map(
      (r) =>
        `| ${r.page} | ${r.width} | ${r.violations.length ? r.violations.map((v) => `${v.id} (${v.nodes.length})`).join(', ') : '0'} | ${r.incomplete.map((i) => i.id).join(', ') || 'none'} | ${r.passes} |`,
    ),
    '',
    'Full results: `axe/axe-results.json`.',
    '',
    '## Lighthouse',
    '',
    '| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | CLS |',
    '|---|---|---|---|---|---|---|---|',
    ...lh.map(
      (s) =>
        `| ${s.page} | ${s.formFactor} | ${s.performance} | ${s.accessibility} | ${s.bestPractices} | ${s.seo} | ${s.lcp} | ${s.cls} |`,
    ),
    '',
    'HTML reports: `lighthouse/<page>-<device>.html` (open in a browser). Scores: `lighthouse/scores.json`.',
    '',
    '## Layout, zoom, keyboard and touch targets',
    '',
    '| Page | Reflow at 320px | 200% text | 200% zoom | Tab stops | Focus problems | Targets under 24px | Targets 44px+ |',
    '|---|---|---|---|---|---|---|---|',
    ...layout.map(
      (r) =>
        `| ${r.page} | ${r.reflow320 ? `${r.reflow320}px sideways scroll` : 'OK'} | ${r.text200 ? `${r.text200}px overflow` : 'OK'} | ${r.zoom200 ? `${r.zoom200}px overflow` : 'OK'} | ${r.tabStops} | ${r.focusProblems.length ? r.focusProblems.join('; ') : 'none'} | ${r.targets.under24.length ? r.targets.under24.join(', ') : 'none'} | ${r.targets.atLeast44} of ${r.targets.total} |`,
    ),
    '',
    'Keyboard walk: tabs through each page from the top, checks every stop has a visible focus outline and is not hidden under the sticky header. Inline text links are exempt from the target-size rule (WCAG 2.5.8 exception).',
    '',
    '## Screenshots',
    '',
    'Every page at 375, 768 and 1440 px: `screenshots/<page>-<width>.jpg`.',
    '',
    '## What automated tools can\'t prove',
    '',
    'Automated checks catch a share of WCAG issues, not all of them. They were backed up by hand checks during the build (keyboard-only use, focus order, error messages on the party form, reduced motion, 200% zoom). Before launch, a quick pass with a real screen reader (VoiceOver on iPhone or NVDA on Windows) is worth doing.',
    '',
  ];
  return lines.join('\n');
}

async function main() {
  console.log('Building launch version…');
  execSync('npx astro build', {
    cwd: root,
    env: { ...process.env, FWB_PREVIEW: 'false', FWB_OUT_DIR: './.audit-dist' },
    stdio: 'ignore',
  });
  await rm(out, { recursive: true, force: true });
  await mkdir(path.join(out, 'axe'), { recursive: true });
  const server = await serve();
  try {
    const browser = await chromium.launch();
    console.log('axe-core…');
    const axe = await axeAll(browser);
    await writeFile(path.join(out, 'axe', 'axe-results.json'), JSON.stringify(axe, null, 2));
    console.log('layout, zoom, keyboard…');
    const layout = await layoutChecks(browser);
    await writeFile(path.join(out, 'layout-checks.json'), JSON.stringify(layout, null, 2));
    console.log('screenshots…');
    await screenshots(browser);
    await browser.close();
    console.log('Lighthouse…');
    const lh = await lighthouseAll();
    await writeFile(path.join(out, 'lighthouse', 'scores.json'), JSON.stringify(lh, null, 2));
    const notes = await readFile(path.join(root, 'scripts', 'audit-notes.md'), 'utf8');
    await writeFile(path.join(out, 'README.md'), `${summary(axe, layout, lh)}\n${notes}`);
    console.log(`\nDone. Summary in reports/README.md`);
  } finally {
    server.kill();
    try {
      execSync('npx astro preview stop', { cwd: root, stdio: 'ignore' });
    } catch {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
