# Design plan (v1, pending approval)

Retro-modern bowling alley: 1950s–60s Googie roadside signage by day, cosmic glow bowling by night, built with a modern layout. Pages alternate between **day sections** (cream, navy ink, cherry and teal, like a diner menu or score sheet) and **night sections** (deep navy with neon, like the lanes with the blacklights on).

A visual version lives in the style tile (`style-tile.html`, shared in the session, not part of the build).

## Palette

| Token | Hex | Role |
|---|---|---|
| Cherry | `#C8102E` | Primary buttons, prices, accents on light |
| Lane Teal | `#08706D` | Links, secondary buttons on light |
| Mustard | `#F6B82F` | Starbursts, badges, banners (always with navy text) |
| Cream | `#FFF3DC` | Day background |
| Paper | `#FFFAF0` | Cards on cream |
| Ink Navy | `#141A3D` | Body text, outlines, hard drop shadows |
| Cosmic Night | `#0B0F2B` | Night background |
| Night Raised | `#1A2257` | Cards on night |
| Neon Pink | `#FF5CD6` | Neon script, glows (night only) |
| Neon Cyan | `#4DF3FF` | Links and focus rings on night, party button |
| Neon Lime | `#C6FF4D` | Lane arrows, "open" status (night only) |
| Cherry Glow | `#FF6B7D` | Cherry for text on night |
| Teal Glow | `#3FE0CF` | Teal for text on night |

**Contrast:** every text pairing clears WCAG AA 4.5:1. The lowest is 5.35:1 (cherry on cream). Run `npm run contrast` to re-check; it fails loudly if any pairing drops below its minimum.

**Banned combos:** mustard or any neon as text on cream (1.1–2.5:1), white on mustard (1.78:1), cherry text on night (3.19:1, swap to Cherry Glow).

## Type

All Google Fonts (SIL Open Font License), self-hosted through Fontsource so the site makes zero requests to Google.

| Role | Font | Notes |
|---|---|---|
| Headings, prices, buttons | **Bungee** | Chunky signage face, ~14 KB |
| Hero sign wordmark only | **Bungee Shade** | 3D marquee letters, home page only, ~30 KB |
| Short accents ("Cosmic Bowling", eyebrows) | **Yellowtail** | 1950s brush script. Short phrases only, never body copy, never the only place info appears |
| Body text, forms, tables | **Atkinson Hyperlegible Next** | Designed by the Braille Institute for low-vision readers. Variable weight, ~34 KB |

Body text is 18px with 1.6 line height. Sizes use `rem` and `clamp()`, so 200% zoom reflows instead of breaking.

## Home hero

A roadside sign at night.

- **Background:** cosmic navy with a scattering of four-point atomic sparkles, light film grain, and a bowling lane in perspective along the bottom edge: gutters, boards, and the seven guide arrows and dots glowing lime and cyan under blacklight, with a pink glow down at the pin deck.
- **The sign (left on desktop, top on mobile):** a cherry Googie arrow edged with marquee bulbs, tilted a few degrees. "Fort Walton Beach" in pink neon script above it, "BOWL" in huge cream Bungee Shade inside it, and a mustard starburst on the arrowhead that reads "OPEN 7 DAYS". The sign is the page's real `<h1>` text, not an image.
- **Next to it:**
  - A live status chip computed in Central Time: "Open now · until 11 PM tonight", "Closed · opens 9 AM", or on Tue–Thu evenings "League play · no open lanes until 8:30 PM". Wording and icon shape carry the meaning, not just color.
  - One line: lanes, leagues, pool, HD sports, full bar for 21+.
  - Two big buttons: **Call for lanes** (cherry, shows 850-863-5603, `tel:` link) and **Book a party** (neon cyan).
  - A mustard league banner, shown every day: "League nights, Tue–Thu: no open lanes from 4:30 to 8:30 PM."
- **Below the hero:** three chunky quick-link cards (Prices, Specials, Parties) with bowling pins that wobble on hover or focus.

## Motion rules

- On load, the neon script flickers on, the bulbs light up in a chase around the sign once, and the starburst spins in. Everything settles within about 2.5 seconds and stays still after that (WCAG 2.2.2: nothing auto-moves past 5 seconds).
- The flicker stays at 2 dips or fewer per second, with a partial dim rather than full on/off, and no saturated-red flashing (WCAG 2.3.1).
- Hover and focus effects only: button lift, pin wobble.
- `prefers-reduced-motion: reduce` turns off every animation and transition. The sign just shows up fully lit.

## Motifs and components

- **Scorecard price cards:** score-sheet frame numbers across the top, each price in a "frame box" with the little corner mark. Real `<table>` markup.
- **Ticket stubs** for the specials, one per day: die-cut notches, dashed perforation, day of the week on the stub.
- **Party package cards** on night background with a mustard starburst price badge.
- **Lane-arrow dividers** between sections, starbursts, atomic sparkles, halftone dots on mustard blocks (kept away from text so contrast stays measurable), light grain on night sections.
- **Buttons:** pill-shaped, thick navy border, hard offset "sticker" shadow (navy on day, mustard on night). At least 44px tall.
- **Focus ring:** 3px navy on day sections, 3px neon cyan on night sections, with a 3px gap.

## Pages

Home, Prices, Specials, Parties (packages and inquiry form), Leagues, Accessibility Statement, Privacy Policy, and a 404. A Food & Drink page if `/menu` turns out to be a food or bar menu, with the bar section marked 21+ and kept off the party pages.

Old URLs keep working through redirects: `/bowling-community` → `/leagues`, and `/menu` goes wherever its content lands.

## Tech

- **Astro**, static output. Zero client JS except a tiny script for the open/closed chip and form validation, both of which degrade gracefully without JS.
- All prices, hours, specials, and packages live in one data file (`src/data/`), so editing a price is a one-file change.
- **Images:** original SVG illustrations, no stock photos and nothing from the current site. Marked slots where the owner can drop real photos later, with Astro converting them to WebP/AVIF.
- **Party form:** Netlify Forms (free tier) with a honeypot field and no CAPTCHA. Works without JS.
- No analytics, no tracking pixels, no embedded Google Map or Facebook widget (plain links instead), no third-party requests at all.

## Spec-build safety

Since this goes in front of the owner before they've said yes, the site ships in **preview mode** by default:

- `noindex` on every page plus a blocking `robots.txt`, so Google never lists it next to the real site.
- A slim banner: "Concept preview. Not the official Fort Walton Beach Bowl website."
- The party form shows a "call to book" message instead of collecting anyone's info, so no real customer request lands in your inbox.

One setting flips all three off at launch.
