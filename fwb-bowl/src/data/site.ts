// ─────────────────────────────────────────────────────────────────────────────
// EDIT PRICES, HOURS, SPECIALS, PARTIES AND LEAGUES HERE.
//
// This is the only file you need to touch to change what the site says.
// Every value must match reference/content.md, so update that file too.
//
// Rules of thumb:
//   • Keep prices as text in quotes, exactly how you want them shown: '$4.00'
//   • Times use the 24-hour clock in quotes: '09:00' is 9 AM, '21:00' is 9 PM
//   • Days are numbers: 0 = Sunday, 1 = Monday … 6 = Saturday
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Preview mode is ON while this is a concept pitch.
 * It hides the site from Google, shows a "concept preview" banner, and stops
 * the party form from sending. Set to false on launch day (see README).
 */
export const previewMode = true;

export const business = {
  name: 'Fort Walton Beach Bowl',
  shortName: 'FWB Bowl',
  tagline: 'Bowling where the balls keep rolling!',
  phone: '850-863-5603',
  phoneHref: 'tel:+18508635603',
  address: {
    street: '745 Beal Pkwy NW',
    city: 'Fort Walton Beach',
    state: 'FL',
    zip: '32547',
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Fort+Walton+Beach+Bowl%2C+745+Beal+Pkwy+NW%2C+Fort+Walton+Beach%2C+FL+32547',
  facebookUrl: 'https://www.facebook.com/Ft-Walton-Beach-Bowl-192013807509244/',
  /** Online party booking (Bowling Passport). Deposits are taken there, never on this site. */
  bookingUrl: 'https://www.mybowlingpassport.com/996/11838/book',
  siteUrl: 'https://www.fwbbowl.com',
  /** Map pin from OpenStreetMap ("Fort Walton Beach Bowl", bowling_alley). Owner to confirm. */
  geo: { latitude: 30.44006, longitude: -86.63663 },
  timeZone: 'America/Chicago',
  payments: ['Visa', 'Mastercard', 'Discover', 'Cash', 'Debit', 'Credit', 'Apple Pay'],
  amenities: ['Bowling', 'Leagues', 'Billiards', 'HD sports', 'Full bar (21+)', 'Parties'],
};

/** "745 Beal Pkwy NW, Fort Walton Beach, FL 32547" */
export const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}`;
/** "Fort Walton Beach, FL 32547" */
export const cityLine = `${business.address.city}, ${business.address.state} ${business.address.zip}`;

export type DayHours = { day: number; opens: string; closes: string };

/** Closing times earlier than opening times mean "after midnight", e.g. Friday 09:00–01:00. */
export const hours: DayHours[] = [
  { day: 1, opens: '09:00', closes: '23:00' }, // Monday 9AM–11PM
  { day: 2, opens: '09:00', closes: '23:00' }, // Tuesday 9AM–11PM
  { day: 3, opens: '09:00', closes: '23:00' }, // Wednesday 9AM–11PM
  { day: 4, opens: '09:00', closes: '23:00' }, // Thursday 9AM–11PM
  { day: 5, opens: '09:00', closes: '01:00' }, // Friday 9AM–1AM
  { day: 6, opens: '12:00', closes: '01:00' }, // Saturday noon–1AM
  { day: 0, opens: '12:00', closes: '20:00' }, // Sunday noon–8PM
];

export const hoursNote = 'Holiday hours may vary. Call to confirm.';

/** "Due to Leagues We Have No Open Lanes Tues-Thurs from 4:30pm-8:30" */
export const leagueBlock = {
  days: [2, 3, 4],
  start: '16:30',
  end: '20:30',
  short: 'No open lanes Tue–Thu, 4:30–8:30 PM',
  long: 'Because of league play, there are no open lanes Tuesday through Thursday from 4:30 to 8:30 PM.',
};

export const priceNotes = {
  tax: 'Prices do not include sales tax.',
  change: 'Prices subject to change. Call 850-863-5603 to confirm.',
};

export type Price = { name: string; price: string; unit: string; when?: string; who?: string[] };

export const shoeRental: Price = { name: 'Shoe rental', price: '$3.75', unit: 'per pair' };

export const gamePrices: Price[] = [
  { name: 'Daytime Special', price: '$4.00', unit: 'per game', when: 'Mon–Fri, 9 AM–5 PM', who: ['All ages'] },
  { name: 'Adults', price: '$5.00', unit: 'per game', when: 'Mon–Fri 5 PM–close, weekends all day' },
  {
    name: 'Children, Military & Seniors',
    price: '$4.50',
    unit: 'per game',
    who: ['Children 17 & under', 'Military with ID', 'Seniors 50+'],
  },
];

export const leaguePrices: Price[] = [
  // The source graphic reads "94M–12PM" (a typo). Shown as 9 AM–12 PM. Owner to confirm.
  { name: 'League bowlers', price: '$2.00', unit: 'per game', when: 'Mon–Fri, 9 AM–12 PM' },
  { name: 'League bowlers', price: '$3.00', unit: 'per game', when: 'All other times' },
];

export type Special = {
  id: string;
  name: string;
  price: string;
  unit: string;
  days: number[];
  start: string;
  end: string;
  when: string;
  details: string[];
};

export const specials: Special[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Bowling',
    price: '$14.00',
    unit: 'per person, plus tax',
    days: [5, 6],
    start: '21:00',
    end: '01:00',
    when: 'Friday & Saturday, 9 PM–1 AM',
    details: ['Unlimited bowling', 'Includes shoe rental'],
  },
  {
    id: 'after-league',
    name: 'After League Special',
    price: '$2.50',
    unit: 'per game, plus tax',
    days: [1, 2, 3, 4],
    start: '21:00',
    end: '23:00',
    when: 'Monday–Thursday, 9 PM–11 PM',
    details: [],
  },
  {
    id: 'daytime',
    name: 'Daytime Special',
    price: '$4.00',
    unit: 'per game',
    days: [1, 2, 3, 4, 5],
    start: '09:00',
    end: '17:00',
    when: 'Monday–Friday, 9 AM–5 PM',
    details: ['All ages'],
  },
];

export const birthdayPackage = {
  name: 'Birthday Package',
  price: '$150',
  lanes: 'Includes 2 lanes',
  guests: 'Up to 12 kids',
  includes: ['2 hours of bowling', 'Shoe rental included', '2 one-topping pizzas', '2 pitchers of soda'],
  blurb: 'Fun kids bowling experience. Perfect for all skill levels!',
};

export const partyRules = [
  'No outside food or drinks (birthday cake allowed)',
  '20% non-refundable deposit required',
  'Must reserve in advance',
];

export const corporateParties =
  'We also offer corporate parties, so you and your employees can relax and have fun. Please call for pricing.';

export type League = {
  day: string;
  name: string;
  bowlTime: string;
  meeting: string;
  start: string;
  note?: string;
};

/** Fall season, from the "Fall Leagues" graphic. Meeting and start dates have passed. */
export const leagueSeason = {
  name: 'Fall leagues',
  status: 'The fall season is underway.',
  signUp: 'Sign up at the front desk or call 850-863-5603 for more info.',
};

export const leagues: League[] = [
  { day: 'Monday', name: 'Mon Night Mixed', bowlTime: '6:30 PM', meeting: 'Aug. 17, 6:00 PM', start: 'Aug. 24' },
  { day: 'Tuesday morning', name: 'Ladies League', bowlTime: '10:00 AM', meeting: 'Aug. 18', start: 'Aug. 25' },
  { day: 'Tuesday night', name: 'Tuesday Night Open', bowlTime: '6:30 PM', meeting: 'Aug. 25', start: 'Sept. 1' },
  { day: 'Wednesday', name: 'Centel Mixed', bowlTime: '6:30 PM', meeting: 'Aug. 26', start: 'Sept. 2' },
  { day: 'Thursday morning', name: 'Senior League (50+)', bowlTime: '10:00 AM', meeting: 'Sept. 3, 9:30 AM', start: 'Sept. 3' },
  { day: 'Thursday night', name: 'Sand Dollar Mixed', bowlTime: '6:00 PM', meeting: 'Aug. 27', start: 'Sept. 3' },
  { day: 'Friday', name: 'D.O.D.', bowlTime: '6:00 PM', meeting: 'Aug. 28', start: 'Sept. 4' },
  { day: 'Saturday morning', name: 'Youth League', bowlTime: '10:00 AM', meeting: 'Aug. 15', start: 'Aug. 22' },
  { day: 'Sunday', name: 'Sunday Funday', bowlTime: '5:00 PM', meeting: 'Sept. 13, 4:30 PM', start: 'Sept. 13' },
];

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
