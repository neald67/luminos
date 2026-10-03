# Fort Walton Beach Bowl: content reference

Source of truth for every price, hour, special, and package on the new site. The site's data lives in `src/data/site.ts` and must match this file exactly. If something changes, change it here first, then there.

Captured from https://www.fwbbowl.com on **2026-10-03** (pages: `/`, `/specials`, `/menu`, `/parties`, `/bowling-community`), desktop and mobile. Screenshots live in `reference/screenshots/` (kept out of git; see `reference/README.md`).

---

## NEEDS VERIFICATION

Things the owner has to confirm before launch. Nothing below was guessed. Each item says exactly what the source shows.

1. **League bowler morning hours have a typo on the source graphic.** The pricing image reads "$2.00 Per Game, Mon–Fri | **94M**–12PM". The new site shows **9 AM–12 PM**, because that's the only reading that fits (the center opens at 9 AM on weekdays). Owner confirms.
2. **League nights vs. "no open lanes" notice.** The notice only covers **Tue–Thu, 4:30–8:30 PM**, but the fall league schedule also has leagues on Monday night (6:30 PM), Friday (6:00 PM), Sunday (5:00 PM), and Tue/Thu/Sat mornings (10:00 AM). Confirm whether open lanes are limited during those other league times too. The new site only shows the Tue–Thu notice, exactly as worded on the current site.
3. **Fall league dates are past.** The schedule shows league meetings and start dates from Aug 15 to Sept 13 (year not printed; it fits 2026). The new site lists the leagues with bowl times and says the fall season is underway. Confirm whether people can still join, and send the next season's schedule when it's ready.
4. **"After League Special" days.** The specials page says **Monday–Thursday** 9pm–11pm, while the no-open-lanes notice only covers Tue–Thu. Shown exactly as the source says (Mon–Thu). Just confirm.
5. **"Children • Military • Seniors" rate ($4.50) has no hours listed.** The new site shows it without hours, same as the source.
6. **Map coordinates** for the schema.org `geo` field. Not on the current site. The new site leaves `geo` out until the owner confirms the pin from their Google Business Profile.
7. **Holiday hours.** Not listed anywhere. The new site says "Holiday hours may vary. Call to confirm."
8. **Bar hours and the 21+ policy details.** The site says "full bar". Bar hours aren't listed. The new site marks alcohol as 21+ with ID.
9. **Gift cards.** The current site shows the words "Gift Cards" with no link and no details. The new site says gift cards are available and to call for details.
10. **Logo.** The new site uses the current header logo file (`IMG_6853`, 1125×455, the "FWB BOWL / BOWLING CENTER" rainbow panels) with the white background removed so it works on dark sections. The older sunburst "FWB BOWL EST '95" badge is still their favicon, so the new site keeps it as the favicon. Confirm which logo is current, and send original vector artwork if they have it.
11. **"EST '95"** appears only on the older badge logo. Not used as a claim in the site copy.
12. **Business name.** The site name is "Fort Walton Beach Bowl". Their graphics also say "FWB Bowl" and "FWB Bowl Bowling Center". The new site uses "Fort Walton Beach Bowl" in text and the logo carries "FWB BOWL".

---

## Business basics

| Field | Value | Source |
|---|---|---|
| Name | Fort Walton Beach Bowl | site header (all pages), brief |
| Short name / logo | FWB Bowl, "FWB BOWL BOWLING CENTER" | logo, pricing and party graphics |
| Address | 745 Beal Pkwy NW, Fort Walton Beach, FL 32547 | site header and footer, brief |
| Phone | 850-863-5603 | site header and footer, brief |
| Time zone | Central (America/Chicago) | brief |
| Facebook | https://www.facebook.com/Ft-Walton-Beach-Bowl-192013807509244/ | footer icon link |
| Online party booking | https://www.mybowlingpassport.com/996/11838/book | "RESERVE NOW" / "RESERVE HERE" buttons on `/parties` |
| Payment accepted | Visa, Mastercard, Discover, cash, debit, credit, Apple Pay | footer payment badges (image alts: "... Payment Accepted") |
| Gift cards | Offered (text only, no link or details) | footer |
| Tagline | "Bowling Where the Balls Keep Rolling!" | home page H2 |
| Amenities | Bowling, bowling leagues, hi-def sports, pool tables / "fully equipped billiard room", full bar, birthday parties, corporate parties, gift cards | home page copy, `/parties`, footer, brief |
| Lane availability note | "Please call for lane availability!" | home page banner; "Please Call for Availability" in contact widget |

### Hours (site footer matches the brief exactly)

| Day | Opens | Closes |
|---|---|---|
| Monday | 9:00 AM | 11:00 PM |
| Tuesday | 9:00 AM | 11:00 PM |
| Wednesday | 9:00 AM | 11:00 PM |
| Thursday | 9:00 AM | 11:00 PM |
| Friday | 9:00 AM | 1:00 AM (Saturday morning) |
| Saturday | 12:00 PM (noon) | 1:00 AM (Sunday morning) |
| Sunday | 12:00 PM (noon) | 8:00 PM |

### League notice (every page header)

"Due to Leagues We Have No Open Lanes Tues-Thurs from 4:30pm-8:30" → **No open lanes Tuesday–Thursday, 4:30–8:30 PM, because of leagues.**

---

## Bowling prices (`/menu`, labeled "PRICES" in their nav; source is the "FWB Bowl Pricing" image)

All prices: **"\*Prices do not include sales tax"** (printed on the image).

| Item | Price | When / who | Source |
|---|---|---|---|
| Shoe rental | **$3.75** | | pricing image |
| Daytime Special | **$4.00 per game** | Mon–Fri, 9 AM–5 PM, all ages | pricing image |
| Adults | **$5.00 per game** | Mon–Fri 5 PM–close; weekends all day | pricing image |
| Children, Military, Seniors | **$4.50 per game** | Children (17 & under), Military (with ID), Seniors (50+). No hours listed | pricing image |
| League bowlers | **$2.00 per game** | Mon–Fri, "94M–12PM" on source (see NEEDS VERIFICATION #1) | pricing image |
| League bowlers | **$3.00 per game** | All other times | pricing image |

---

## Specials (`/specials`, real text on the page)

| Special | Price | When | Details | Source |
|---|---|---|---|---|
| After League Special | **$2.50 a game**, plus tax | Monday–Thursday, 9 PM–11 PM | | specials page text |
| Cosmic Bowling | **$14.00 a person**, plus tax | Friday and Saturday, 9 PM–1 AM | Unlimited bowling, includes shoe rental | specials page text |

---

## Parties (`/parties`; source is the "Kid's Birthday Party Packages" image plus page text)

### $150 Birthday Package

| Field | Value |
|---|---|
| Price | **$150** |
| Lanes | Includes 2 lanes |
| Guests | Up to 12 kids |
| Included | 2 hours of bowling · shoe rental included · 2 one-topping pizzas · 2 pitchers of soda |
| Tagline on flyer | "Fun Kids Bowling Experience – Perfect for All Skill Levels!" |

**Party details** (printed on the flyer):
- No outside food or drinks (birthday cake allowed)
- 20% non-refundable deposit required
- Must reserve in advance

**Reserve online:** "RESERVE NOW" / "CLICK HERE TO RESERVE NOW" → https://www.mybowlingpassport.com/996/11838/book

### Corporate parties (page text)

"We also offer corporate parties to make sure you and your employees can relax and have fun! Please call for pricing."

### Home page party blurb

"Throwing a party? Let Fort Walton Beach Bowl host your event; it is sure to be a hit for all ages! We can provide everything you need for your child's birthday party at an unbeatable price."

---

## Leagues (`/bowling-community`, labeled "LEAGUES" in their nav; source is the "Fall Leagues" image)

Headline: "Fall Leagues: Find the league that's right for you!"
Also printed: "Good Friends. Great Bowling. Even Better Times!" · "More leagues. More friends. More fun!" · "All skill levels welcome!" · "Sign up at the front desk or call 850-863-5603 for more info!"

| Day | League | Bowl time | League meeting | Start date |
|---|---|---|---|---|
| Monday | Mon Night Mixed | 6:30 PM | Aug. 17, 6:00 PM | Aug. 24 |
| Tuesday morning | Ladies League | 10:00 AM | Aug. 18 | Aug. 25 |
| Tuesday night | Tuesday Night Open | 6:30 PM | Aug. 25 | Sept. 1 |
| Wednesday | Centel Mixed | 6:30 PM | Aug. 26 | Sept. 2 |
| Thursday morning | Senior League (50+) | 10:00 AM | Sept. 3, 9:30 AM | Sept. 3 |
| Thursday night | Sand Dollar Mixed | 6:00 PM | Aug. 27 | Sept. 3 |
| Friday | D.O.D. | 6:00 PM | Aug. 28 | Sept. 4 |
| Saturday morning | Youth League | 10:00 AM | Aug. 15 | Aug. 22 |
| Sunday | Sunday Funday | 5:00 PM | Sept. 13, 4:30 PM | Sept. 13 |

League bowler game prices: see Bowling prices above ($2.00 / $3.00).

---

## Home page copy (for reference, rewritten on the new site, facts kept)

- "Bowling in Fort Walton Beach, FL"
- "Fort Walton Beach Bowl - Bowling Where the Balls Keep Rolling!"
- "Fort Walton Beach Bowl is the place for family fun in Fort Walton Beach, FL! With bowling leagues, hi def sports, and pool tables, we have fun for everyone. Head over to the fully equipped billiard room to shoot some pool and enjoy our full bar with all of your favorite drinks."
- Party blurb (see Parties).

---

## Brand

| Element | Value | Source |
|---|---|---|
| Logo (current) | "FWB BOWL" white letters on tilted rainbow panels, black "BOWLING CENTER" pill with orange rim | mobile header image `IMG_6853` (1125×455 PNG) |
| Logo (older badge) | Sunburst square: F-W-B and B-O-W-L in circles, black ball hitting red-striped pins, teal halo, "EST '95" | favicon + Thryv contact widget avatar |
| Logo panel colors | orange `#EFAD63` · yellow `#EDDA72` · lime `#A9CD6A` · green `#6CB762` · blue `#4C72B3` · red `#CC5247` · purple `#835BA1` · black `#08090B` | sampled from logo pixels |
| Site colors | plum `#601D6C` → periwinkle `#5D5CE4` (header/footer gradient) · violet `#7636FF` → electric blue `#180CF2` (notice bar) · deep plum `#3E1246` (active nav) · cyan `#2AC5FD` | current site CSS |

---

## Found on the current site but NOT carried over

- **Expired promos** in the home page's background slideshow (code only, not visible in the screenshots): "$25 Per Hour Special" (Mon 12/22 & Tue 12/23, Mon 12/29 & Tue 12/30, $25 per hour per lane, "Reservations recommended but walk-ins welcome") and "New Years Party Eve" ($100 plus tax a lane, up to 6 people, unlimited bowling 9PM–1AM, includes shoe rental, party favors, New Year's toast). Both are from last December. Worth asking the owner if they want a 2026 New Year's Eve special listed.
- **Photos and graphics.** Their site says its images may not be republished, so none of their photos or flyers are used. The new site uses original illustrations and marked photo slots. The logo is the one exception, since it's their own brand mark and the site is for them.
