// schema.org data for search engines: a BowlingAlley (a kind of LocalBusiness)
// with address, phone, hours and map pin, built from src/data/site.ts.
import { business, dayNames, hours } from '../data/site';

export function businessSchema() {
  const site = business.siteUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'BowlingAlley',
    '@id': `${site}/#business`,
    name: business.name,
    alternateName: business.shortName,
    url: `${site}/`,
    logo: `${site}/brand/fwb-bowl-logo.png`,
    image: `${site}/og-image.png`,
    telephone: '+1-850-863-5603',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    hasMap: business.mapsUrl,
    // A closing time earlier than the opening time means after midnight (Fri/Sat 1 AM).
    openingHoursSpecification: hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${dayNames[h.day]}`,
      opens: h.opens,
      closes: h.closes,
    })),
    paymentAccepted: 'Cash, Credit Card, Debit Card, Apple Pay',
    currenciesAccepted: 'USD',
    sameAs: [business.facebookUrl],
  };
}
