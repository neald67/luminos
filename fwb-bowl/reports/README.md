# Audit reports

Generated 2026-10-03 by `npm run audit` against the **launch build** (preview mode off), served locally.
Chromium from Playwright, axe-core via @axe-core/playwright, Lighthouse 13.

## axe-core (WCAG 2.0, 2.1, 2.2 A + AA, plus best practices)

Every page at 375, 768 and 1440 px. **0 violations** across 27 page/width runs.

| Page | Width | Violations | Needs review (manual) | Rules passed |
|---|---|---|---|---|
| home | 375 | 0 | color-contrast | 44 |
| home | 768 | 0 | color-contrast | 44 |
| home | 1440 | 0 | color-contrast | 43 |
| prices | 375 | 0 | color-contrast | 43 |
| prices | 768 | 0 | color-contrast | 43 |
| prices | 1440 | 0 | color-contrast | 42 |
| specials | 375 | 0 | color-contrast | 44 |
| specials | 768 | 0 | color-contrast | 44 |
| specials | 1440 | 0 | color-contrast | 43 |
| parties | 375 | 0 | color-contrast | 50 |
| parties | 768 | 0 | color-contrast | 50 |
| parties | 1440 | 0 | color-contrast | 50 |
| leagues | 375 | 0 | color-contrast | 49 |
| leagues | 768 | 0 | color-contrast | 48 |
| leagues | 1440 | 0 | color-contrast | 47 |
| accessibility | 375 | 0 | color-contrast | 43 |
| accessibility | 768 | 0 | color-contrast | 43 |
| accessibility | 1440 | 0 | color-contrast | 42 |
| privacy | 375 | 0 | color-contrast | 43 |
| privacy | 768 | 0 | color-contrast | 43 |
| privacy | 1440 | 0 | color-contrast | 42 |
| party-thanks | 375 | 0 | color-contrast | 43 |
| party-thanks | 768 | 0 | color-contrast | 43 |
| party-thanks | 1440 | 0 | color-contrast | 42 |
| not-found | 375 | 0 | color-contrast | 43 |
| not-found | 768 | 0 | color-contrast | 43 |
| not-found | 1440 | 0 | color-contrast | 42 |

Full results: `axe/axe-results.json`.

## Lighthouse

| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|---|
| home | mobile | 99 | 100 | 100 | 100 | 1.8 s | 0 |
| home | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |
| prices | mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| prices | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |
| specials | mobile | 100 | 100 | 100 | 100 | 1.5 s | 0 |
| specials | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |
| parties | mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| parties | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |
| leagues | mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| leagues | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |
| accessibility | mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| accessibility | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |
| privacy | mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| privacy | desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 |

HTML reports: `lighthouse/<page>-<device>.html` (open in a browser). Scores: `lighthouse/scores.json`.

## Layout, zoom, keyboard and touch targets

| Page | Reflow at 320px | 200% text | 200% zoom | Tab stops | Focus problems | Targets under 24px | Targets 44px+ |
|---|---|---|---|---|---|---|---|
| home | OK | OK | OK | 27 | none | none | 21 of 27 |
| prices | OK | OK | OK | 17 | none | none | 13 of 17 |
| specials | OK | OK | OK | 16 | none | none | 12 of 16 |
| parties | OK | OK | OK | 32 | none | none | 24 of 30 |
| leagues | OK | OK | OK | 19 | none | none | 13 of 18 |
| accessibility | OK | OK | OK | 17 | none | none | 13 of 17 |
| privacy | OK | OK | OK | 16 | none | none | 12 of 16 |
| party-thanks | OK | OK | OK | 16 | none | none | 14 of 16 |
| not-found | OK | OK | OK | 19 | none | none | 17 of 19 |

Keyboard walk: tabs through each page from the top, checks every stop has a visible focus outline and is not hidden under the sticky header. Inline text links are exempt from the target-size rule (WCAG 2.5.8 exception).

## Screenshots

Every page at 375, 768 and 1440 px: `screenshots/<page>-<width>.jpg`.

## What automated tools can't prove

Automated checks catch a share of WCAG issues, not all of them. They were backed up by hand checks during the build (keyboard-only use, focus order, error messages on the party form, reduced motion, 200% zoom). Before launch, a quick pass with a real screen reader (VoiceOver on iPhone or NVDA on Windows) is worth doing.

## Manual review: axe "needs review" color contrast

axe marks text on the dark sections as "needs review" because it can't measure contrast over CSS gradients (the soft violet and electric-blue glows) and the film-grain texture. Checked by hand instead, using the **worst case**: both glows overlapping at full strength plus the brightest grain speck. Real pages are darker than this almost everywhere.

| Background | Worst-case color | Contrast for each text color | Lowest |
|---|---|---|---|
| page header: violet 40% + electric 45% overlap + grain | `#351DB3` | cream 10.0 · soft 6.9 · yellow 7.5 · cyan 5.3 · lime 5.9 · orange 5.5 | **5.32:1** |
| home hero: violet 35% + electric 40% overlap + grain | `#341CA6` | cream 10.6 · soft 7.3 · yellow 8.0 · cyan 5.6 · lime 6.2 · orange 5.8 | **5.62:1** |
| specials band: electric 35% + violet 30% overlap + grain | `#3C209A` | cream 10.6 · soft 7.4 · yellow 8.0 · cyan 5.6 · lime 6.2 · orange 5.8 | **5.64:1** |
| cosmic card (deep plum, no glow) | `#3E1246` | cream 14.3 · soft 9.9 · yellow 10.8 · cyan 7.6 · lime 8.4 · orange 7.8 | **7.61:1** |

Everything clears WCAG AA (4.5:1), even in the worst case. Solid-color pairings are covered by `npm run contrast` (33 of 33 pass).

## Other checks done by hand during the build

- **Party form:** an empty submit moves focus to an error summary that links to each field. Each field gets `aria-invalid` and a text error tied to it with `aria-describedby`. Errors clear as you type, and the layout doesn't jump mid-click. In preview mode a valid submit shows a status message and sends nothing. Without JavaScript the preview button is disabled, and at launch the form posts normally to Netlify.
- **Menu:** the mobile menu button reports open/closed (`aria-expanded`), and Escape closes it and returns focus. Without JavaScript the full nav simply shows.
- **Motion:** the lane ball-roll and pin flash run once and finish in under 4 seconds. With reduced motion turned on, all animation and transitions are off.
- **Live open/closed badge:** tested at 10 different Central Time moments, including after-midnight closings on Friday and Saturday, the Tue–Thu league block, and specials running.
