import * as Location from 'expo-location';
import { MOCK_MODE } from './constants';

export const DEFAULT_MOCK_LOCATION = { lat: 37.7749, lng: -122.4194 }; // SF

export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  if (MOCK_MODE) return DEFAULT_MOCK_LOCATION;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return DEFAULT_MOCK_LOCATION;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return DEFAULT_MOCK_LOCATION;
  }
}

export function getDistanceBucketLabel(bucket: string): string {
  const labels: Record<string, string> = {
    super_close: '<0.5 mi away',
    nearby: 'Less than a mile',
    bit_further: '1–3 miles away',
    far: '3–5 miles away',
  };
  return labels[bucket] ?? 'Nearby';
}
