-- ============================================================
-- Migration 003: Row Level Security Policies
-- ============================================================

-- ============================================================
-- profiles
-- Public read of safe fields; self-managed writes
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_self_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- profile_interests
-- ============================================================
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_interests_public_read" ON profile_interests
  FOR SELECT USING (true);

CREATE POLICY "profile_interests_self_manage" ON profile_interests
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- availability_sessions
-- NO direct client read of raw location — nearby queries go via Edge Function
-- ============================================================
ALTER TABLE availability_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_self_manage" ON availability_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- hangout_requests
-- Only sender and receiver can read/update; only sender can insert
-- ============================================================
ALTER TABLE hangout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "requests_read" ON hangout_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "requests_insert" ON hangout_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "requests_update" ON hangout_requests
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================================
-- hangouts
-- Participants only
-- ============================================================
ALTER TABLE hangouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hangouts_participants" ON hangouts
  FOR SELECT USING (is_hangout_participant(id, auth.uid()));

CREATE POLICY "hangouts_update_participants" ON hangouts
  FOR UPDATE USING (is_hangout_participant(id, auth.uid()));

-- ============================================================
-- hangout_participants
-- ============================================================
ALTER TABLE hangout_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hparticipants_read" ON hangout_participants
  FOR SELECT USING (is_hangout_participant(hangout_id, auth.uid()));

CREATE POLICY "hparticipants_self_update" ON hangout_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- conversations
-- Members only
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_members" ON conversations
  FOR SELECT USING (is_conversation_member(id, auth.uid()));

-- ============================================================
-- conversation_members
-- ============================================================
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_members_read" ON conversation_members
  FOR SELECT USING (
    auth.uid() = user_id OR is_conversation_member(conversation_id, auth.uid())
  );

-- ============================================================
-- messages
-- Members can read and insert in their own conversations
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read" ON messages
  FOR SELECT USING (is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND is_conversation_member(conversation_id, auth.uid())
  );

-- ============================================================
-- crews
-- ============================================================
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crews_members_read" ON crews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM crew_members WHERE crew_id = id AND user_id = auth.uid())
  );

CREATE POLICY "crews_insert" ON crews
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "crews_owner_update" ON crews
  FOR UPDATE USING (auth.uid() = owner_id);

-- ============================================================
-- crew_members
-- ============================================================
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_members_read" ON crew_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM crew_members cm WHERE cm.crew_id = crew_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "crew_members_self_insert" ON crew_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM crews WHERE id = crew_id AND owner_id = auth.uid())
    OR auth.uid() = user_id
  );

-- ============================================================
-- blocks
-- Blockers manage their own blocks; blocked users cannot see
-- ============================================================
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_self" ON blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert" ON blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete" ON blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================================
-- reports
-- Users can create reports and read their own
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_self_read" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================================
-- host_profiles
-- ============================================================
ALTER TABLE host_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "host_profiles_public_read" ON host_profiles
  FOR SELECT USING (true);

CREATE POLICY "host_profiles_owner_manage" ON host_profiles
  FOR ALL USING (auth.uid() = owner_user_id);

-- ============================================================
-- host_events
-- Public events readable by all; owner can manage
-- ============================================================
ALTER TABLE host_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_public_read" ON host_events
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "events_owner_all" ON host_events
  USING (
    EXISTS (SELECT 1 FROM host_profiles hp WHERE hp.id = host_id AND hp.owner_user_id = auth.uid())
  );

-- ============================================================
-- event_rsvps
-- ============================================================
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rsvps_self_manage" ON event_rsvps
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "rsvps_event_owner_read" ON event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM host_events he
      JOIN host_profiles hp ON hp.id = he.host_id
      WHERE he.id = event_id AND hp.owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- subscriptions
-- Self read only; no direct writes
-- ============================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_self_read" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- points_wallets
-- Read own; NO direct writes from client
-- ============================================================
ALTER TABLE points_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_self_read" ON points_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- points_ledger
-- Read own; NO direct writes from client
-- ============================================================
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_self_read" ON points_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- point_escrows
-- Read own; NO direct writes from client
-- ============================================================
ALTER TABLE point_escrows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escrow_self_read" ON point_escrows
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- verification_sessions
-- ============================================================
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_sessions_participants" ON verification_sessions
  FOR SELECT USING (is_hangout_participant(hangout_id, auth.uid()));

-- ============================================================
-- verification_events
-- ============================================================
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_events_participants" ON verification_events
  FOR SELECT USING (is_hangout_participant(hangout_id, auth.uid()));

-- ============================================================
-- qr_checkin_codes
-- Own codes only
-- ============================================================
ALTER TABLE qr_checkin_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qr_codes_self" ON qr_checkin_codes
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- hangout_risk_scores
-- Participants read
-- ============================================================
ALTER TABLE hangout_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_scores_participants" ON hangout_risk_scores
  FOR SELECT USING (is_hangout_participant(hangout_id, auth.uid()));

-- ============================================================
-- communities
-- Public read
-- ============================================================
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communities_public_read" ON communities
  FOR SELECT USING (true);

-- ============================================================
-- leaderboard_snapshots
-- Public read (display-safe only — no coordinates, no PII)
-- ============================================================
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_public_read" ON leaderboard_snapshots
  FOR SELECT USING (true);
