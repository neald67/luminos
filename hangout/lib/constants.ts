import type { ActivityType } from './types';

export const ACTIVITY_CONFIG: Record<ActivityType, { label: string; emoji: string; icon: string }> = {
  coffee:      { label: 'Coffee',       emoji: '☕', icon: 'cafe-outline' },
  food:        { label: 'Food',         emoji: '🍜', icon: 'restaurant-outline' },
  gym:         { label: 'Gym',          emoji: '💪', icon: 'barbell-outline' },
  basketball:  { label: 'Basketball',   emoji: '🏀', icon: 'basketball-outline' },
  walk:        { label: 'Walk',         emoji: '🚶', icon: 'walk-outline' },
  study:       { label: 'Study',        emoji: '📚', icon: 'book-outline' },
  boba:        { label: 'Boba',         emoji: '🧋', icon: 'cafe-outline' },
  photos:      { label: 'Photos',       emoji: '📸', icon: 'camera-outline' },
  thrift:      { label: 'Thrift',       emoji: '🛍️', icon: 'bag-outline' },
  gaming:      { label: 'Gaming',       emoji: '🎮', icon: 'game-controller-outline' },
  library:     { label: 'Library',      emoji: '📖', icon: 'library-outline' },
  open_mic:    { label: 'Open Mic',     emoji: '🎤', icon: 'mic-outline' },
  board_games: { label: 'Board Games',  emoji: '🎲', icon: 'dice-outline' },
  general:     { label: 'General',      emoji: '✌️', icon: 'happy-outline' },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_CONFIG) as ActivityType[];

export const DISTANCE_BUCKET_LABELS = {
  super_close: 'Super close · <0.5mi',
  nearby:      'Nearby · <1mi',
  bit_further: 'A bit further · 1-3mi',
  far:         'Further · 3-5mi',
};

export const HANGOUT_DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3+ hours', value: 180 },
];

export const HANGOUT_RADII = [
  { label: '1 mi', value: 1 },
  { label: '2 mi', value: 2 },
  { label: '3 mi', value: 3 },
  { label: '5 mi', value: 5 },
  { label: '10 mi', value: 10 },
];

export const POINTS = {
  INITIAL_BALANCE: 100,
  PROFILE_BONUS: 25,
  SAFETY_ONBOARDING_BONUS: 25,
  STAKE_AMOUNT: 50,
  BASE_BONUS: 25,
  MIN_QUALIFYING_MINUTES: 20,
  MAX_DAILY_BONUS: 150,
  MAX_WEEKLY_BONUS: 600,
  RESPECT_REBATE_LATE_CANCEL: 5,
  RESPECT_REBATE_NO_SHOW: 10,
  RESPECT_REBATE_WEEKLY_CAP: 30,
} as const;

export const RELIABILITY_LABELS = {
  90: 'Very reliable',
  70: 'Pretty reliable',
  50: 'Somewhat reliable',
  0: 'Unreliable',
};

export const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';
export const MOCK_PREMIUM = process.env.EXPO_PUBLIC_MOCK_PREMIUM === 'true';
export const TEEN_MODE_ENABLED = process.env.EXPO_PUBLIC_ENABLE_TEEN_MODE === 'true';
