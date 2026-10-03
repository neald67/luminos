// WCAG 2.2 contrast check for every text/background pairing the design uses.
// Body text needs 4.5:1, large text (24px+, or 18.66px+ bold) and UI parts need 3:1.
// Run: npm run contrast   (exits non-zero if any pairing fails)

export const palette = {
  cream: '#FFF3DC', // day background
  paper: '#FFFAF0', // cards on cream
  ink: '#141A3D', // body text on light, deep navy
  night: '#0B0F2B', // night (cosmic) background
  nightRaised: '#1A2257', // cards on night
  cherry: '#C8102E', // primary buttons, accents on light
  cherryGlow: '#FF6B7D', // cherry for text on night
  teal: '#08706D', // secondary buttons, links on light
  tealGlow: '#3FE0CF', // teal for text on night
  mustard: '#F6B82F', // starbursts, price badges, highlight blocks
  neonPink: '#FF5CD6', // cosmic accent (script sign, glows)
  neonCyan: '#4DF3FF', // cosmic accent (focus rings on night, links on night)
  neonLime: '#C6FF4D', // cosmic accent (lane arrows, small badges)
  white: '#FFFFFF',
};

// [foreground, background, minimum ratio, where it's used]
export const pairings = [
  ['ink', 'cream', 4.5, 'body text, day sections'],
  ['ink', 'paper', 4.5, 'body text on price cards'],
  ['cherry', 'cream', 4.5, 'links, small headings on day sections'],
  ['cherry', 'paper', 4.5, 'prices on scorecard cards'],
  ['teal', 'cream', 4.5, 'links on day sections'],
  ['teal', 'paper', 4.5, 'secondary text on cards'],
  ['cream', 'cherry', 4.5, 'primary button label'],
  ['white', 'cherry', 4.5, 'primary button label (alt)'],
  ['cream', 'teal', 4.5, 'secondary button label'],
  ['ink', 'mustard', 4.5, 'text on mustard badges and banners'],
  ['cream', 'night', 4.5, 'body text, night sections'],
  ['cream', 'nightRaised', 4.5, 'body text on night cards'],
  ['mustard', 'night', 4.5, 'headings and prices on night'],
  ['mustard', 'nightRaised', 4.5, 'prices on night cards'],
  ['neonPink', 'night', 4.5, 'neon script, accents on night'],
  ['neonCyan', 'night', 4.5, 'links on night'],
  ['neonCyan', 'nightRaised', 4.5, 'links on night cards'],
  ['neonLime', 'night', 4.5, 'badges on night'],
  ['cherryGlow', 'night', 4.5, 'cherry accents on night'],
  ['tealGlow', 'night', 4.5, 'teal accents on night'],
  ['ink', 'neonCyan', 4.5, 'button label on cyan'],
  ['ink', 'neonLime', 4.5, 'label on lime badge'],
  ['ink', 'neonPink', 4.5, 'label on pink badge'],
  ['ink', 'cream', 3, 'focus ring on day sections'],
  ['neonCyan', 'night', 3, 'focus ring on night sections'],
  ['ink', 'cream', 3, 'form field borders'],
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
    const ratio = contrast(palette[fg], palette[bg]);
    const ok = ratio >= min;
    if (!ok) failures += 1;
    return `| ${fg} ${palette[fg]} | ${bg} ${palette[bg]} | ${ratio.toFixed(2)}:1 | ${min}:1 | ${ok ? 'PASS' : 'FAIL'} | ${use} |`;
  });
  console.log('| Foreground | Background | Ratio | Needs | Result | Used for |');
  console.log('|---|---|---|---|---|---|');
  console.log(rows.join('\n'));
  console.log(failures ? `\n${failures} pairing(s) FAIL` : '\nAll pairings pass.');
  process.exit(failures ? 1 : 0);
}
