import type {
  NearbyUser,
  HangoutRequest,
  Hangout,
  Profile,
  Conversation,
  Message,
} from '@/lib/types';

// ─── Current User ────────────────────────────────────────────────────────────

export const MOCK_CURRENT_USER: Profile = {
  id: 'current-user-id',
  username: 'you',
  display_name: 'You',
  avatar_url: null,
  bio: 'Always down for something',
  birthdate: '2001-03-15',
  age_bracket: '21-24',
  is_18_plus: true,
  community_id: null,
  profile_theme: 'default',
  map_pin_style: 'default',
  availability_default_radius_miles: 3,
  availability_default_duration_minutes: 60,
  safety_onboarding_completed: true,
  profile_completed: true,
  interests: ['coffee', 'photos', 'walk'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─── Nearby Users ─────────────────────────────────────────────────────────────

export const MOCK_NEARBY_USERS: NearbyUser[] = [
  {
    user_id: 'user-maya',
    display_name: 'Maya',
    username: 'maya.h',
    avatar_url: null,
    bio_short: 'Coffee addict. Will photograph anything.',
    available_for: ['coffee', 'photos', 'walk'],
    status_note: 'Free until 6pm ☕',
    distance_bucket: 'super_close',
    expires_in_minutes: 45,
    points_badge: 320,
    reliability_label: 'Very reliable',
    mutual_crew_count: 1,
  },
  {
    user_id: 'user-jay',
    display_name: 'Jay',
    username: 'jayb',
    avatar_url: null,
    bio_short: 'Gym 6 days a week. Basketball on weekends.',
    available_for: ['gym', 'basketball', 'food'],
    status_note: null,
    distance_bucket: 'nearby',
    expires_in_minutes: 30,
    points_badge: 180,
    reliability_label: 'Pretty reliable',
    mutual_crew_count: 0,
  },
  {
    user_id: 'user-lena',
    display_name: 'Lena',
    username: 'lena.k',
    avatar_url: null,
    bio_short: 'PhD student. Boba is a food group.',
    available_for: ['study', 'boba', 'library'],
    status_note: 'Studying at the library rn',
    distance_bucket: 'nearby',
    expires_in_minutes: 90,
    points_badge: 445,
    reliability_label: 'Very reliable',
    mutual_crew_count: 2,
  },
  {
    user_id: 'user-chris',
    display_name: 'Chris',
    username: 'chrisg',
    avatar_url: null,
    bio_short: 'Thrift king. Food everywhere.',
    available_for: ['thrift', 'food', 'walk'],
    status_note: null,
    distance_bucket: 'bit_further',
    expires_in_minutes: 55,
    points_badge: 95,
    reliability_label: 'Somewhat reliable',
    mutual_crew_count: 0,
  },
  {
    user_id: 'user-noor',
    display_name: 'Noor',
    username: 'noor.a',
    avatar_url: null,
    bio_short: 'Walks and library days.',
    available_for: ['walk', 'library', 'boba'],
    status_note: 'Down for a chill one',
    distance_bucket: 'nearby',
    expires_in_minutes: 70,
    points_badge: 210,
    reliability_label: 'Very reliable',
    mutual_crew_count: 1,
  },
  {
    user_id: 'user-eli',
    display_name: 'Eli',
    username: 'eli.r',
    avatar_url: null,
    bio_short: 'Gaming + food. Usually both at once.',
    available_for: ['gaming', 'food'],
    status_note: null,
    distance_bucket: 'bit_further',
    expires_in_minutes: 120,
    points_badge: 155,
    reliability_label: 'Pretty reliable',
    mutual_crew_count: 0,
  },
];

// ─── Pending Requests ─────────────────────────────────────────────────────────

export const MOCK_PENDING_REQUESTS: HangoutRequest[] = [
  {
    id: 'req-1',
    sender_id: 'user-maya',
    receiver_id: 'current-user-id',
    crew_id: null,
    event_id: null,
    mode: 'casual',
    activity: 'coffee',
    proposed_time: new Date(Date.now() + 2 * 3_600_000).toISOString(),
    estimated_duration_minutes: 60,
    place_name: 'Blue Bottle Coffee',
    general_location: 'SOMA',
    note: 'Coffee and a walk? I know a good spot near the park.',
    status: 'pending',
    expires_at: new Date(Date.now() + 2 * 3_600_000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-maya',
    body: 'Hey! Still down for coffee?',
    created_at: new Date(Date.now() - 10 * 60_000).toISOString(),
    read_at: null,
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'current-user-id',
    body: 'Absolutely, see you at Blue Bottle!',
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    read_at: new Date().toISOString(),
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    hangout_request_id: 'req-1',
    participant_ids: ['current-user-id', 'user-maya'],
    last_message_body: 'Absolutely, see you at Blue Bottle!',
    last_message_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    unread_count: 0,
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
  },
];

// ─── Active / Completed Hangouts ─────────────────────────────────────────────

export const MOCK_HANGOUTS: Hangout[] = [
  {
    id: 'hangout-1',
    request_id: 'req-1',
    host_id: 'user-maya',
    participant_ids: ['current-user-id', 'user-maya'],
    activity: 'coffee',
    mode: 'casual',
    proposed_time: new Date(Date.now() + 2 * 3_600_000).toISOString(),
    estimated_duration_minutes: 60,
    place_name: 'Blue Bottle Coffee',
    general_location: 'SOMA',
    status: 'planned',
    qr_code_token: 'mock-qr-abc123',
    qr_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    host_checked_in: false,
    guest_checked_in: false,
    completed_at: null,
    points_awarded: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─── Points Wallet ────────────────────────────────────────────────────────────

export const MOCK_WALLET = {
  user_id: 'current-user-id',
  balance: 320,
  total_earned: 520,
  streak_days: 4,
  reliability_score: 0.92,
  reliability_label: 'Very reliable',
  hangouts_completed: 14,
  hangouts_bailed: 1,
};

// ─── Sender Profiles map ──────────────────────────────────────────────────────

export const MOCK_SENDER_PROFILES: Record<string, Profile> = {
  'user-maya': {
    id: 'user-maya',
    username: 'maya.h',
    display_name: 'Maya',
    avatar_url: null,
    bio: 'Coffee addict. Will photograph anything.',
    birthdate: '2000-07-20',
    age_bracket: '21-24',
    is_18_plus: true,
    community_id: null,
    profile_theme: 'default',
    map_pin_style: 'default',
    availability_default_radius_miles: 3,
    availability_default_duration_minutes: 60,
    safety_onboarding_completed: true,
    profile_completed: true,
    interests: ['coffee', 'photos', 'walk'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-jay': {
    id: 'user-jay',
    username: 'jayb',
    display_name: 'Jay',
    avatar_url: null,
    bio: 'Gym 6 days a week. Basketball on weekends.',
    birthdate: '1999-11-03',
    age_bracket: '21-24',
    is_18_plus: true,
    community_id: null,
    profile_theme: 'default',
    map_pin_style: 'default',
    availability_default_radius_miles: 5,
    availability_default_duration_minutes: 90,
    safety_onboarding_completed: true,
    profile_completed: true,
    interests: ['gym', 'basketball', 'food'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};
