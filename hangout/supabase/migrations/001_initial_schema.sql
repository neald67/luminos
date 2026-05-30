-- ============================================================
-- Migration 001: Initial Schema
-- Hangout app — social platform for spontaneous real-life plans
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- communities
-- ============================================================
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('campus','school','city','private','crew')),
  min_age int,
  max_age int,
  invite_only boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  birthdate date,
  age_bracket text,
  is_18_plus boolean NOT NULL DEFAULT false,
  community_id uuid REFERENCES communities(id),
  profile_theme text NOT NULL DEFAULT 'default',
  map_pin_style text NOT NULL DEFAULT 'default',
  availability_default_radius_miles numeric NOT NULL DEFAULT 3,
  availability_default_duration_minutes int NOT NULL DEFAULT 60,
  safety_onboarding_completed boolean NOT NULL DEFAULT false,
  profile_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profiles_community_idx ON profiles(community_id);

-- ============================================================
-- profile_interests
-- ============================================================
CREATE TABLE profile_interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest)
);
CREATE INDEX profile_interests_user_idx ON profile_interests(user_id);

-- ============================================================
-- blocks
-- ============================================================
CREATE TABLE blocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
CREATE INDEX blocks_blocker_idx ON blocks(blocker_id);
CREATE INDEX blocks_blocked_idx ON blocks(blocked_id);

-- ============================================================
-- reports
-- ============================================================
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL REFERENCES profiles(id),
  reported_user_id uuid REFERENCES profiles(id),
  reported_event_id uuid,
  reported_message_id uuid,
  reported_hangout_id uuid,
  category text NOT NULL CHECK (category IN ('harassment','unsafe_behavior','fake_profile','spam','inappropriate_content','underage_concern','no_show_abuse','location_abuse','other')),
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_reporter_idx ON reports(reporter_id);
CREATE INDEX reports_reported_user_idx ON reports(reported_user_id);

-- ============================================================
-- availability_sessions
-- ============================================================
CREATE TABLE availability_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended','expired')),
  available_for text[] NOT NULL DEFAULT '{}',
  status_note text,
  radius_miles numeric NOT NULL DEFAULT 3,
  location geography(Point, 4326),
  approximate_geohash text,
  visibility text NOT NULL DEFAULT 'nearby' CHECK (visibility IN ('nearby','community_only','friends_only','invisible')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX availability_sessions_user_status_idx ON availability_sessions(user_id, status);
CREATE INDEX availability_sessions_location_idx ON availability_sessions USING GIST(location);
CREATE INDEX availability_sessions_expires_idx ON availability_sessions(expires_at);

-- ============================================================
-- hangout_requests
-- ============================================================
CREATE TABLE hangout_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES profiles(id),
  receiver_id uuid REFERENCES profiles(id),
  crew_id uuid,
  event_id uuid,
  mode text NOT NULL DEFAULT 'casual' CHECK (mode IN ('casual','verified')),
  activity text NOT NULL,
  proposed_time timestamptz NOT NULL,
  estimated_duration_minutes int NOT NULL DEFAULT 60,
  place_name text NOT NULL,
  general_location text NOT NULL,
  location geography(Point, 4326),
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','countered','expired','canceled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hangout_requests_sender_idx ON hangout_requests(sender_id);
CREATE INDEX hangout_requests_receiver_idx ON hangout_requests(receiver_id);
CREATE INDEX hangout_requests_status_idx ON hangout_requests(status);

-- ============================================================
-- hangouts
-- ============================================================
CREATE TABLE hangouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES hangout_requests(id),
  mode text NOT NULL DEFAULT 'casual' CHECK (mode IN ('casual','verified')),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','active','completed','canceled','safety_cancelled','disputed','expired')),
  activity text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  general_location text NOT NULL,
  place_name text NOT NULL,
  verification_status text NOT NULL DEFAULT 'not_started' CHECK (verification_status IN ('not_started','in_progress','completed','failed')),
  verified_duration_minutes int NOT NULL DEFAULT 0,
  risk_score int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX hangouts_status_idx ON hangouts(status);
CREATE INDEX hangouts_request_idx ON hangouts(request_id);

-- ============================================================
-- hangout_participants
-- ============================================================
CREATE TABLE hangout_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('organizer','participant')),
  status text NOT NULL DEFAULT 'joined' CHECK (status IN ('joined','completed','canceled','no_show')),
  checked_in_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  no_show boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hangout_id, user_id)
);
CREATE INDEX hangout_participants_hangout_idx ON hangout_participants(hangout_id);
CREATE INDEX hangout_participants_user_idx ON hangout_participants(user_id);

-- ============================================================
-- conversations & messages
-- ============================================================
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid REFERENCES hangouts(id),
  crew_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversation_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
CREATE INDEX conv_members_conv_idx ON conversation_members(conversation_id);
CREATE INDEX conv_members_user_idx ON conversation_members(user_id);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_id uuid NOT NULL REFERENCES profiles(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX messages_conv_idx ON messages(conversation_id, created_at DESC);

-- ============================================================
-- crews
-- ============================================================
CREATE TABLE crews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  avatar_url text,
  owner_id uuid NOT NULL REFERENCES profiles(id),
  is_plus boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crew_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(crew_id, user_id)
);
CREATE INDEX crew_members_crew_idx ON crew_members(crew_id);
CREATE INDEX crew_members_user_idx ON crew_members(user_id);

-- ============================================================
-- host_profiles & host_events
-- ============================================================
CREATE TABLE host_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id uuid NOT NULL REFERENCES profiles(id),
  host_name text NOT NULL,
  host_type text NOT NULL DEFAULT 'individual_creator' CHECK (host_type IN ('individual_creator','club','school_group','venue','business','community')),
  description text NOT NULL DEFAULT '',
  avatar_url text,
  verified boolean NOT NULL DEFAULT false,
  is_pro boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE host_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id uuid NOT NULL REFERENCES host_profiles(id),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  general_location text NOT NULL,
  location geography(Point, 4326),
  capacity int,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','community_only','invite_only')),
  price_label text NOT NULL DEFAULT 'free' CHECK (price_label IN ('free','paid_at_venue','unknown')),
  safety_notes text,
  featured_until timestamptz,
  recurring_rule text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX host_events_start_idx ON host_events(start_time);
CREATE INDEX host_events_location_idx ON host_events USING GIST(location);

CREATE TABLE event_rsvps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES host_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going','waitlist','canceled')),
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  provider text NOT NULL DEFAULT 'revenuecat',
  entitlement text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON subscriptions(user_id);

-- ============================================================
-- points system
-- ============================================================
CREATE TABLE points_wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 100,
  lifetime_earned int NOT NULL DEFAULT 100,
  lifetime_spent_or_forfeited int NOT NULL DEFAULT 0,
  weekly_score int NOT NULL DEFAULT 0,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  reliability_score int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE points_ledger (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  hangout_id uuid REFERENCES hangouts(id),
  escrow_id uuid,
  type text NOT NULL CHECK (type IN ('onboarding_bonus','stake_lock','stake_return','completion_bonus','cancellation_penalty','no_show_penalty','respect_rebate','reversal','admin_adjustment')),
  amount int NOT NULL,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','held','reversed','expired','forfeited','returned')),
  reason text NOT NULL DEFAULT '',
  risk_score int NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);
CREATE INDEX points_ledger_user_idx ON points_ledger(user_id);
CREATE INDEX points_ledger_hangout_idx ON points_ledger(hangout_id);

CREATE TABLE point_escrows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  amount int NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','returned','forfeited','partially_returned','frozen')),
  locked_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE(hangout_id, user_id)
);

CREATE TABLE verification_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE verification_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  event_type text NOT NULL CHECK (event_type IN ('qr_generated','qr_scanned','checkin_ping','start','end','safety_bail')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  approximate_geohash text,
  distance_bucket text,
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX verification_events_hangout_idx ON verification_events(hangout_id);

CREATE TABLE qr_checkin_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX qr_codes_hangout_idx ON qr_checkin_codes(hangout_id);

CREATE TABLE hangout_risk_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hangout_id uuid NOT NULL REFERENCES hangouts(id),
  score int NOT NULL DEFAULT 0,
  reasons jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope text NOT NULL CHECK (scope IN ('friends','crew','community','city')),
  scope_id uuid,
  user_id uuid NOT NULL REFERENCES profiles(id),
  score int NOT NULL DEFAULT 0,
  rank int NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leaderboard_scope_period_idx ON leaderboard_snapshots(scope, period_start, period_end);
