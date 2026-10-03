# Before launch: owner checklist

Go through this with the owner before turning preview mode off. Everything on the site came from the current fwbbowl.com or from the owner. Nothing was guessed, but a few things need a yes or a fix. Details and sources are in [`reference/content.md`](reference/content.md).

## 1. Prices and specials (must confirm)

- [ ] **Every price is current:** shoes $3.75 · Daytime Special $4.00/game (Mon–Fri 9 AM–5 PM, all ages) · Adults $5.00/game (Mon–Fri 5 PM–close, weekends all day) · Children/Military/Seniors $4.50/game · League bowlers $2.00 and $3.00 · Cosmic Bowling $14.00/person · After League Special $2.50/game · Birthday Package $150.
- [ ] **League morning rate hours.** Their price graphic says "Mon–Fri | **94M**–12PM", which is a typo. The new site shows **9 AM–12 PM**. Is that right?
- [ ] **After League Special days.** Their site says Monday–Thursday, 9–11 PM, but leagues only block lanes Tue–Thu. Is Monday right?
- [ ] **Children/Military/Seniors $4.50.** Any days or times it doesn't apply? (None listed now.)
- [ ] **Anything missing?** Lane-by-the-hour pricing, a food or bar menu, a New Year's Eve special? Their site had an expired $25/hour-per-lane holiday promo and a New Year's Eve party ($100/lane) from last December.

## 2. Hours and leagues

- [ ] **Hours** are right: Mon–Thu 9 AM–11 PM · Fri 9 AM–1 AM · Sat noon–1 AM · Sun noon–8 PM. The live "Open now / Closed" badge runs off these.
- [ ] **Holiday hours.** The site says "Holiday hours may vary. Call to confirm." Okay?
- [ ] **League lane blocks.** Only Tue–Thu 4:30–8:30 PM is shown as "no open lanes". There are also leagues Monday 6:30 PM, Friday 6 PM, Sunday 5 PM and Tue/Thu/Sat mornings at 10 AM. Do those block open bowling too?
- [ ] **League schedule** is the fall season (started Aug 22 to Sept 13). Can people still join? Send the next season's schedule when it's ready.
- [ ] **Bar hours** and the **21+ policy**. The site says "Full bar. 21+ only." Are the bar and pool tables open during league hours?

## 3. Parties

- [ ] **Birthday Package** details: $150, 2 lanes, 2 hours, shoes, 2 one-topping pizzas, 2 pitchers of soda, up to 12 kids.
- [ ] **Party rules:** no outside food or drinks (cake allowed), 20% non-refundable deposit, reserve in advance.
- [ ] **Bowling Passport link** still works: https://www.mybowlingpassport.com/996/11838/book, and deposits are taken there (the site says no card details are taken on the website).
- [ ] **Where should party inquiries go?** Give us the email address for Netlify form notifications (see README).
- [ ] **Corporate parties:** "call for pricing" still right?

## 4. Brand and photos

- [ ] **Logo.** The site uses the current "FWB BOWL / BOWLING CENTER" logo from their mobile site, with the white background removed. The older sunburst "EST '95" badge is still their favicon, so it stays as the favicon. Which is the official logo? **Ask for the original artwork** (AI, EPS, SVG or a big PNG) so it's razor sharp.
- [ ] **Business name:** "Fort Walton Beach Bowl" in text everywhere. Is "FWB Bowl" okay as a short name?
- [ ] **Photos.** The site uses original illustrations. Get 5–10 real photos (lanes with cosmic lights on, billiard room, bar/TVs, a party set-up, the front of the building) and drop them into the "Photo spot" places. **Only use photos they own or have permission for.**
- [ ] **Map pin.** Search data uses coordinates 30.44006, -86.63663 (from OpenStreetMap's "Fort Walton Beach Bowl" listing). Check it lines up with their Google Business Profile pin.
- [ ] **Facebook link** goes to the right page: https://www.facebook.com/Ft-Walton-Beach-Bowl-192013807509244/ (its profile photo is currently an unrelated "Tre Strong" crab image).
- [ ] **Gift cards.** How do people buy them (front desk, phone, online)? Any set amounts?

## 5. Legal review

- [ ] **Privacy policy** (`/privacy/`): owner reads it, and ideally their attorney does. Confirm how long they keep party inquiries ("only as long as needed to plan your event").
- [ ] **Accessibility statement** (`/accessibility/`): add an **email address** for accessibility feedback, and decide on a response time (for example "within 2 business days").
- [ ] **Words in the owner's voice** that are new on this site: the party form ("we'll get back to you", "no marketing, no selling or sharing", the 18+ checkbox), the thank-you message, and the "Prices subject to change" and "Holiday hours may vary" notes. Make sure the owner is happy to stand behind them.
- [ ] Don't market the site as "ADA compliant" or "lawsuit-proof". The honest claim is "built and tested to WCAG 2.2 AA".
- [ ] If analytics get added later, use a privacy-friendly one and update the privacy policy first.

## 6. Launch steps (whoever deploys)

- [ ] Set `PREVIEW_MODE = false` in `src/data/site.ts`.
- [ ] Deploy on Netlify, then turn on form email notifications.
- [ ] Send a test party inquiry and make sure the email arrives.
- [ ] Point `fwbbowl.com` and `www.fwbbowl.com` at Netlify and check HTTPS works.
- [ ] Check `/menu` and `/bowling-community` redirect to the new pages.
- [ ] Run `npm run audit` one more time and keep the `reports/` folder.
- [ ] Optional: submit `https://www.fwbbowl.com/sitemap-index.xml` in Google Search Console, and update the website link on their Google Business Profile.
- [ ] Quick screen reader pass (VoiceOver on an iPhone is fine): home page, prices, and sending the party form.
