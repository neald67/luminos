-- ============================================================
-- Migration 002: Helper Functions & Triggers
-- ============================================================

-- Check if two users have blocked each other (either direction)
CREATE OR REPLACE FUNCTION users_blocked_each_other(user_a uuid, user_b uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if a user is a member of a conversation
CREATE OR REPLACE FUNCTION is_conversation_member(p_conv_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = p_conv_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if a user is a participant in a hangout
CREATE OR REPLACE FUNCTION is_hangout_participant(p_hangout_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM hangout_participants
    WHERE hangout_id = p_hangout_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER hangout_requests_updated_at
  BEFORE UPDATE ON hangout_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER hangouts_updated_at
  BEFORE UPDATE ON hangouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER points_wallets_updated_at
  BEFORE UPDATE ON points_wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
