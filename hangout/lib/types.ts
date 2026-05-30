// ─── Design ───────────────────────────────────────────────────────────────────

export const COLORS = {
  bg: '#050505',
  bg2: '#0A0A0B',
  card: '#101114',
  card2: '#15171C',
  border: '#262A31',
  accent: '#00FF85',
  accent2: '#7CFF6B',
  blue: '#4DA3FF',
  text: '#F4F4F5',
  muted: '#A1A1AA',
  danger: '#FF6B4A',
  dangerBg: '#2A1A16',
} as const;

// ─── Core domain types ────────────────────────────────────────────────────────

export type AgeBracket = '13-15' | '16-17' | '18-20' | '21-24' | '25-29' | '30+';

export type ActivityType =
  | 'coffee' | 'food' | 'gym' | 'basketball' | 'walk'
  | 'study' | 'boba' | 'photos' | 'thrift' | 'gaming'
  | 'library' | 'open_mic' | 'board_games' | 'general';

export type DistanceBucket = 'super_close' | 'nearby' | 'bit_further' | 'far';

export type HangoutMode = 'casual' | 'verified';

export type HangoutStatus =
  | 'planned' | 'active' | 'completed' | 'canceled' | 'cancelled' | 'bailed'
  | 'safety_cancelled' | 'disputed' | 'expired';

export type RequestStatus =
  | 'pending' | 'accepted' | 'declined' | 'countered' | 'expired' | 'canceled';

export type PointsLedgerType =
  | 'onboarding_bonus' | 'stake_lock' | 'stake_return'
  | 'stake_locked' | 'stake_returned' | 'stake_forfeit'
  | 'completion_bonus' | 'cancellation_penalty' | 'no_show_penalty'
  | 'profile_bonus' | 'safety_bonus'
  | 'respect_rebate' | 'reversal' | 'admin_adjustment';

export type PointsStatus =
  | 'pending' | 'approved' | 'held' | 'reversed' | 'expired' | 'forfeited' | 'returned';

// ─── Database models ──────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  birthdate: string | null;
  age_bracket: AgeBracket | null;
  is_18_plus: boolean;
  community_id: string | null;
  profile_theme: string;
  map_pin_style: string;
  availability_default_radius_miles: number;
  availability_default_duration_minutes: number;
  safety_onboarding_completed: boolean;
  profile_completed: boolean;
  interests?: string[];
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySession {
  id: string;
  user_id: string;
  status: 'active' | 'ended' | 'expired';
  available_for: ActivityType[];
  status_note: string | null;
  radius_miles: number;
  expires_at: string;
  created_at: string;
}

export interface NearbyUser {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio_short: string | null;
  available_for: ActivityType[];
  status_note: string | null;
  distance_bucket: DistanceBucket;
  expires_in_minutes: number;
  points_badge: number;
  reliability_label: string;
  mutual_crew_count: number;
}

export interface HangoutRequest {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  crew_id: string | null;
  event_id: string | null;
  mode: HangoutMode;
  activity: ActivityType;
  proposed_time: string;
  estimated_duration_minutes: number;
  place_name: string;
  general_location: string;
  note: string;
  status: RequestStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export interface Hangout {
  id: string;
  request_id: string;
  mode: HangoutMode;
  status: HangoutStatus;
  activity: ActivityType;
  // Flat mock-friendly fields (used in mock-data and screens)
  host_id: string;
  participant_ids: string[];
  proposed_time: string;
  estimated_duration_minutes: number;
  qr_code_token: string | null;
  qr_expires_at: string | null;
  host_checked_in: boolean;
  guest_checked_in: boolean;
  completed_at: string | null;
  points_awarded: boolean;
  // Optional DB fields
  start_time?: string;
  end_time?: string | null;
  general_location: string;
  place_name: string;
  verification_status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  verified_duration_minutes?: number;
  risk_score?: number;
  created_at: string;
  updated_at: string;
  participants?: HangoutParticipant[];
}

export interface HangoutParticipant {
  id: string;
  hangout_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  status: 'joined' | 'completed' | 'canceled' | 'no_show';
  checked_in_at: string | null;
  completed_at: string | null;
  created_at: string;
  profile?: Profile;
}

export interface PointsWallet {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent_or_forfeited: number;
  weekly_score: number;
  current_streak: number;
  longest_streak: number;
  reliability_score: number;
  created_at: string;
  updated_at: string;
}

export interface PointsLedgerEntry {
  id: string;
  user_id: string;
  hangout_id: string | null;
  escrow_id: string | null;
  type: PointsLedgerType;
  amount: number;
  status: PointsStatus;
  reason: string;
  risk_score: number;
  created_at: string;
  approved_at: string | null;
}

export interface Crew {
  id: string;
  name: string;
  avatar_url: string | null;
  owner_id: string;
  is_plus: boolean;
  member_count?: number;
  created_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  deleted_at?: string | null;
  read_at?: string | null;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  hangout_id?: string | null;
  hangout_request_id?: string | null;
  crew_id?: string | null;
  // Flat mock-friendly fields
  participant_ids: string[];
  last_message_body?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  created_at: string;
  // Optional DB fields
  members?: Profile[];
  last_message?: Message;
}

export interface HostProfile {
  id: string;
  owner_user_id: string;
  host_name: string;
  host_type: 'individual_creator' | 'club' | 'school_group' | 'venue' | 'business' | 'community';
  description: string;
  avatar_url: string | null;
  verified: boolean;
  is_pro: boolean;
  created_at: string;
}

export interface HostEvent {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: string;
  start_time: string;
  end_time: string;
  general_location: string;
  capacity: number | null;
  visibility: 'public' | 'community_only' | 'invite_only';
  price_label: 'free' | 'paid_at_venue' | 'unknown';
  safety_notes: string | null;
  featured_until: string | null;
  rsvp_count: number;
  created_at: string;
  host?: HostProfile;
}

export interface Entitlements {
  hasHangoutPlus: boolean;
  hasCrewPlus: boolean;
  hasHostPro: boolean;
  canUsePremiumTheme: boolean;
  canUseAIPlanUnlimited: boolean;
  canCreateHostEvent: boolean;
  canAccessAdvancedFilters: boolean;
}

export interface PlanCard {
  title: string;
  vibe: string;
  activity: ActivityType;
  suggestedPlaceType: string;
  durationMinutes: number;
  estimatedBudget: string;
  whyItFits: string;
  safetyNote: string;
  suggestedMessage: string;
}
