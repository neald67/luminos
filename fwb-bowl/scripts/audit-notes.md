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
