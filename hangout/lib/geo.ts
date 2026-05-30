// Client-safe geo utilities (no raw coordinates exposed to other users)

/**
 * Encode a lat/lng coordinate pair into a geohash string.
 * Uses a simple base32 implementation.
 * @param lat Latitude
 * @param lng Longitude
 * @param precision Number of geohash characters (default 5, ~5km accuracy)
 */
export function geohashFromCoords(lat: number, lng: number, precision = 5): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0, bit = 0, even = true;
  let latRange = [-90.0, 90.0], lngRange = [-180.0, 180.0];
  let hash = '';
  while (hash.length < precision) {
    if (even) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) { idx = (idx << 1) | 1; lngRange[0] = mid; }
      else { idx = idx << 1; lngRange[1] = mid; }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) { idx = (idx << 1) | 1; latRange[0] = mid; }
      else { idx = idx << 1; latRange[1] = mid; }
    }
    even = !even;
    if (++bit === 5) { hash += BASE32[idx]; idx = 0; bit = 0; }
  }
  return hash;
}

/**
 * Round coordinates to approximately 500m precision for privacy.
 * Rounds to 2 decimal places (~1.1km) but at 1/200 scale (~500m).
 */
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 200) / 200,
    lng: Math.round(lng * 200) / 200,
  };
}

/**
 * Compute distance in meters between two lat/lng points using the Haversine formula.
 * Used only client-side for UI hints — never for security decisions.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Classify a distance in meters into a human-friendly bucket.
 */
export function distanceBucket(
  meters: number
): 'super_close' | 'nearby' | 'bit_further' | 'far' {
  if (meters < 800) return 'super_close';
  if (meters < 1600) return 'nearby';
  if (meters < 5000) return 'bit_further';
  return 'far';
}

/**
 * Convert miles to meters.
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.344;
}

/**
 * Convert meters to miles, rounded to 1 decimal.
 */
export function metersToMiles(meters: number): number {
  return Math.round((meters / 1609.344) * 10) / 10;
}
