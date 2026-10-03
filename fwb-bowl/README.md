# Fort Walton Beach Bowl website

A fast, accessible, retro-modern website for Fort Walton Beach Bowl, built with [Astro](https://astro.build). It's a plain static site: no database, no server, nothing to patch. Free hosting on Netlify handles it.

> **It ships in preview mode.** Until the owner signs off, the site hides itself from Google, shows a "Concept preview" banner, and the party form doesn't send. See [Going live](#going-live).

---

## Run it on your computer

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
cd fwb-bowl
npm install
npm run dev
```

Open http://localhost:4321. Edits show up instantly.

The audit and capture scripts drive a real browser. The first time you run them on a new computer, install it once with `npx playwright install chromium`.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds the finished site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder so you can check it |
| `npm run audit` | Runs axe, Lighthouse, zoom, keyboard and tap-target checks on every page and writes `reports/` |
| `npm run contrast` | Checks every color pairing against WCAG AA |
| `npm run capture` | Re-captures the old fwbbowl.com site into `reference/` (screenshots stay on your computer) |

---

## Edit prices, hours, specials, parties or leagues

**Everything lives in one file: [`src/data/site.ts`](src/data/site.ts).** Every page reads from it, so a change there updates the home page, the prices page, the specials page and the search-engine data all at once.

Examples:

```ts
// Change the shoe rental price
export const shoeRental: Price = { name: 'Shoe rental', price: '$3.75', unit: 'per pair' };
//                                                              ^^^^^ edit this

// Change a special
{
  id: 'cosmic',
  name: 'Cosmic Bowling',
  price: '$14.00',        // what people see
  days: [5, 6],           // 0 = Sunday, 1 = Monday … 5 = Friday, 6 = Saturday
  start: '21:00',         // 24-hour clock: 21:00 is 9 PM
  end: '01:00',           // an end earlier than the start means after midnight
  when: 'Friday & Saturday, 9 PM–1 AM',
  …
}
```

Rules of thumb:
- Keep prices in quotes, exactly how you want them shown: `'$4.00'`.
- Times are 24-hour in quotes: `'09:00'` is 9 AM, `'23:00'` is 11 PM.
- The live "Open now / Closed" badge reads the `hours` list, so update hours there and the badge follows.
- Update [`reference/content.md`](reference/content.md) too, so the reference stays true.

**No coding setup?** Edit the file right on GitHub: open `fwb-bowl/src/data/site.ts`, click the pencil icon, make the change, and click **Commit changes**. Netlify rebuilds the site in about a minute.

### Swap in real photos

Spots marked "Photo spot" (visible only in preview mode) are where real photos of the lanes and parties should go. Drop the photos in `src/assets/photos/` and use Astro's `<Picture>` component, which automatically makes fast WebP/AVIF versions. Ask whoever maintains the site, or follow https://docs.astro.build/en/guides/images/.

---

## Deploy it free on Netlify

1. Push this repo to GitHub (already done if you're reading this there).
2. Go to https://app.netlify.com → **Add new site** → **Import an existing project** → pick the repo.
3. Set **Base directory** to `fwb-bowl`. Netlify reads the rest from `netlify.toml` (build command `npm run build`, publish folder `dist`).
4. Click **Deploy**. You get a free `something.netlify.app` address right away.

Every change pushed to GitHub redeploys automatically.

**Vercel works too:** import the repo, set the root directory to `fwb-bowl`, framework "Astro". The one difference: Netlify Forms (the party form) only works on Netlify. On Vercel, point the form at a service like Formspree instead.

### Party form emails

The form uses **Netlify Forms**, which is included on Netlify's free plan (check their current monthly submission limit). After the first deploy with preview mode off:

1. Netlify → your site → **Forms**. You'll see `party-inquiry`.
2. **Form notifications** → **Add notification** → **Email notification** → enter the address that should get party inquiries.

Spam protection is a hidden "honeypot" field plus Netlify's built-in filtering. There's no CAPTCHA, because those puzzles lock out a lot of people with disabilities.

---

## Going live

When the owner approves:

1. In `src/data/site.ts`, change `const PREVIEW_MODE = true;` to `false`. That one change:
   - removes the "Concept preview" banner and the "Photo spot" notes
   - lets Google index the site (`robots.txt` and the robots meta tag both flip)
   - turns the party form on (Netlify Forms)
2. Work through [`CHECKLIST.md`](CHECKLIST.md).
3. In Netlify → **Domain management**, add `fwbbowl.com` and `www.fwbbowl.com`, then update the DNS where the domain is registered. Netlify adds HTTPS automatically.
4. Old addresses keep working: `/menu` goes to `/prices/` and `/bowling-community` goes to `/leagues/` (see `public/_redirects`).

---

## What's in here

```
fwb-bowl/
├── src/
│   ├── data/site.ts        ← all prices, hours, specials, parties, leagues
│   ├── pages/              ← one file per page
│   ├── components/         ← header, footer, lane art, ticket stubs, form…
│   ├── lib/                ← open/closed logic (Central Time), schema.org data
│   ├── styles/             ← colors (tokens.css) and base styles
│   └── assets/brand/       ← the FWB BOWL logo
├── public/                 ← fonts, favicon, share image, redirects, security headers
├── reference/content.md    ← everything captured from the old site, with sources
├── reports/                ← accessibility and Lighthouse results
├── scripts/                ← capture, audit, contrast check, share-image maker
├── CHECKLIST.md            ← what the owner must confirm before launch
├── CREDITS.md              ← fonts, logo and artwork sources
└── DESIGN.md               ← colors, type and design decisions
```

## Accessibility and legal notes

- Built to **WCAG 2.2 AA**. See [`reports/README.md`](reports/README.md) for the latest axe and Lighthouse results and the [accessibility statement](src/pages/accessibility.astro).
- **No tracking.** No cookies, analytics, ad pixels or third-party scripts. Fonts are self-hosted. If analytics are ever added, pick a privacy-friendly one (Plausible, Fathom or Netlify Analytics) and update the privacy policy first.
- **No payments on the site.** Party reservations and deposits go through the existing Bowling Passport booking page.
- **Kids' privacy.** The party form is for adults 18+, asks for nothing about the birthday child, and says so.
- **Alcohol.** The bar is only mentioned on the home page and marked 21+. It never appears on the parties page.
