// WCAG 2.2 contrast check for every text/background pairing the design uses.
// Reads the colors straight from src/styles/tokens.css so it can't drift.
// Normal text needs 4.5:1. Large text (24px+, or 18.66px+ bold), icons and UI
// edges need 3:1. Run: npm run contrast  (exits non-zero if anything fails)

import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(import.meta.dirname, '..', 'src/styles/tokens.css'), 'utf8');
export const palette = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map(([, name, hex]) => [name, hex.toUpperCase()]),
);
palette.white = '#FFFFFF';

// [foreground, background, minimum, where it's used]
export const pairings = [
  // Day sections
  ['ink', 'paper', 4.5, 'body text on the page'],
  ['ink', 'card', 4.5, 'body text on white cards'],
  ['ink-soft', 'paper', 4.5, 'secondary text on the page'],
  ['ink-soft', 'card', 4.5, 'secondary text on cards'],
  ['site-electric', 'paper', 4.5, 'links on the page'],
  ['site-electric', 'card', 4.5, 'links on cards'],
  ['site-plum', 'paper', 4.5, 'eyebrow labels'],
  ['site-plum', 'card', 4.5, 'eyebrow labels on cards'],
  ['white', 'site-electric', 4.5, 'primary button label'],
  ['site-electric', 'paper', 3, 'focus ring on light'],
  ['ink', 'paper', 3, 'form field borders, ghost button border'],
  ['paper', 'ink', 4.5, 'ghost button hover label'],
  // Text on logo panels
  ['ink', 'logo-yellow', 4.5, 'text on yellow panels and buttons'],
  ['ink', 'logo-orange', 4.5, 'text on orange panels'],
  ['ink', 'logo-lime', 4.5, 'text on lime panels'],
  ['ink', 'logo-green', 4.5, 'text on green panels'],
  ['white', 'logo-blue', 4.5, 'text on blue panels'],
  ['white', 'logo-purple', 4.5, 'text on purple panels'],
  ['white', 'site-plum', 4.5, 'text on plum panels'],
  ['white', 'logo-red', 3, 'LARGE text only on red panels (24px+)'],
  // Night sections
  ['on-night', 'night', 4.5, 'body text, night sections'],
  ['on-night', 'night-raised', 4.5, 'body text on night cards'],
  ['on-night-soft', 'night', 4.5, 'secondary text, night sections'],
  ['on-night-soft', 'night-raised', 4.5, 'secondary text on night cards'],
  ['logo-yellow', 'night', 4.5, 'headings and prices on night'],
  ['logo-yellow', 'night-raised', 4.5, 'prices on night cards'],
  ['logo-orange', 'night', 4.5, 'accents on night'],
  ['logo-lime', 'night', 4.5, 'open-status text on night'],
  ['logo-lime', 'night-raised', 4.5, 'checkmarks and labels on night cards'],
  ['site-cyan', 'night', 4.5, 'links on night'],
  ['site-cyan', 'night-raised', 4.5, 'links on night cards'],
  ['logo-yellow', 'night', 3, 'focus ring on night'],
  ['ink', 'site-cyan', 4.5, 'text on cyan badges'],
];

const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [0, 1, 2].map((i) => linear(channel(hex, i)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  let failures = 0;
  const rows = pairings.map(([fg, bg, min, use]) => {
    if (!palette[fg] || !palette[bg]) throw new Error(`Unknown token in pairing: ${fg} on ${bg}`);
    const ratio = contrast(palette[fg], palette[bg]);
    const ok = ratio >= min;
    if (!ok) failures += 1;
    return `| ${fg} \`${palette[fg]}\` | ${bg} \`${palette[bg]}\` | ${ratio.toFixed(2)}:1 | ${min}:1 | ${ok ? 'PASS' : '**FAIL**'} | ${use} |`;
  });
  console.log('| Foreground | Background | Ratio | Needs | Result | Used for |');
  console.log('|---|---|---|---|---|---|');
  console.log(rows.join('\n'));
  console.log(failures ? `\n${failures} pairing(s) FAIL` : `\nAll ${pairings.length} pairings pass.`);
  process.exit(failures ? 1 : 0);
}
