# Design notes (v2)

Retro-modern bowling alley, built from **Fort Walton Beach Bowl's own brand**: the tilted rainbow panels of their FWB BOWL logo, plus the purple and electric blue of their current website. Day sections are clean and warm. Night sections are "cosmic bowling" with blacklight glows.

**v2 changes after review:** switched to the business's real logo and colors, toned the retro down a notch for a more modern feel (soft shadows, rounder cards, fewer heavy outlines, script font only for "Cosmic Bowling"), and redrew the hero lane in true perspective so the arrows and dots lie flat on the lanes.

## Colors

Exact brand colors, with text pairings all checked by `npm run contrast` (33 of 33 pass WCAG AA).

**From the logo panels:** orange `#EFAD63` · yellow `#EDDA72` · lime `#A9CD6A` · green `#6CB762` · blue `#4C72B3` · red `#CC5247` · purple `#835BA1`

**From the current site:** electric blue `#180CF2` (buttons, links, the league notice bar) · deep plum `#3E1246` (night cards, active nav) · plum `#601D6C` · violet `#7636FF` (glows) · cyan `#2AC5FD` (links on dark)

**Neutrals:** ink `#1F0A26` (text) · paper `#FFFBF3` (page) · white cards · cosmic night `#16061F`

Rules:
- Text on yellow, orange, lime or green panels is ink. On blue, purple or plum it's white.
- The logo's red is never behind small text (it can't reach 4.5:1 with ink or white). Red only appears in shapes and large type.
- Neon colors (cyan, yellow, lime) only carry text on the dark night background.

## Type

| Role | Font |
|---|---|
| Headings and prices | Bungee (chunky sign lettering) |
| Body, buttons, forms | Atkinson Hyperlegible Next (Braille Institute, built for low-vision readers) |
| "Cosmic Bowling" only | Yellowtail neon script |

All self-hosted. Sizes use `clamp()` and `rem` so text scales cleanly to 200%.

## Motifs

- **Logo panels everywhere:** price tags, icon tiles and league names sit on tilted color panels with black outlines, just like the letters in the logo. A strip of panels marks the footer and page headers.
- **Cosmic lane hero:** eight lanes drawn with a pinhole-camera projection. Lane arrows are flat triangles in the real V layout, guide dots are flattened ellipses, pins stand at the far end, and the masking panels above the pins spell F-W-B B-O-W-L in the logo's colors.
- **Score-sheet price tables** with frame numbers and corner boxes. **Ticket stubs** for specials. **Starburst** price badges.

## Motion

- On load, a ball rolls down the lane and the pins flash once. Everything settles in under 4 seconds and nothing loops (WCAG 2.2.2).
- No flashing faster than 3 times a second (WCAG 2.3.1).
- Hover lift on buttons and cards only.
- `prefers-reduced-motion` turns all of it off.

## Layout

Mobile first, tested at 320, 375, 768 and 1440 px. Sticky slim header (logo, nav, call button). The menu collapses behind a "Menu" button on small screens. Without JavaScript the nav simply shows in full. Focus outlines are 3px electric blue on light sections and yellow on dark ones, and `scroll-padding` keeps focused items out from under the sticky header.
