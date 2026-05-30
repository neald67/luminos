-- ============================================================
-- Seed Data — Hangout App
-- 10 mock users, interests, wallets, availability sessions,
-- host events, and a crew
-- All users are 18+, all locations are San Francisco area
-- ============================================================

-- NOTE: In production, run this AFTER applying all migrations.
-- Auth users are created via Supabase auth admin API or dashboard;
-- these UUIDs are deterministic seeds for dev/staging only.

-- ============================================================
-- Mock user UUIDs (deterministic for dev)
-- ============================================================
DO $$
DECLARE
  u_maya    uuid := 'a1000000-0000-0000-0000-000000000001';
  u_jay     uuid := 'a1000000-0000-0000-0000-000000000002';
  u_lena    uuid := 'a1000000-0000-0000-0000-000000000003';
  u_chris   uuid := 'a1000000-0000-0000-0000-000000000004';
  u_noor    uuid := 'a1000000-0000-0000-0000-000000000005';
  u_eli     uuid := 'a1000000-0000-0000-0000-000000000006';
  u_priya   uuid := 'a1000000-0000-0000-0000-000000000007';
  u_marcus  uuid := 'a1000000-0000-0000-0000-000000000008';
  u_zoe     uuid := 'a1000000-0000-0000-0000-000000000009';
  u_dani    uuid := 'a1000000-0000-0000-0000-000000000010';
  host_id_1 uuid := 'b1000000-0000-0000-0000-000000000001';
  crew_id_1 uuid := 'c1000000-0000-0000-0000-000000000001';
BEGIN

-- ============================================================
-- Profiles
-- ============================================================
INSERT INTO profiles (id, username, display_name, avatar_url, bio, birthdate, age_bracket, is_18_plus,
  profile_theme, map_pin_style, availability_default_radius_miles,
  availability_default_duration_minutes, safety_onboarding_completed, profile_completed)
VALUES
  (u_maya,   'maya_sf',    'Maya',   NULL, 'Coffee addict, avid hiker, always down for spontaneous plans.', '2000-03-15', '18-24', true, 'default', 'default', 3, 60,  true, true),
  (u_jay,    'jay_vibes',  'Jay',    NULL, 'Pickup basketball, boba runs, and random city walks.', '1999-07-22', '18-24', true, 'night', 'default', 5, 90,  true, true),
  (u_lena,   'lena.art',   'Lena',   NULL, 'Photographer and thrift store enthusiast. I find the good light.', '2001-11-08', '18-24', true, 'default', 'camera', 4, 120, true, true),
  (u_chris,  'chrisbtw',   'Chris',  NULL, 'Gym, food, repeat. Always looking for a gym buddy or a good brunch spot.', '1998-05-30', '25-30', true, 'default', 'default', 3, 75,  true, true),
  (u_noor,   'noor.reads', 'Noor',   NULL, 'Library lover, board game nerd, and open mic regular.', '2001-01-18', '18-24', true, 'soft', 'default', 2, 90,  true, true),
  (u_eli,    'eli_runs',   'Eli',    NULL, 'Distance runner turned casual jogger. Park walks are my therapy.', '2002-09-12', '18-24', true, 'default', 'runner', 4, 60,  true, true),
  (u_priya,  'priya.dev',  'Priya',  NULL, 'CS student by day, boba critic by night. Study sessions welcome.', '2001-04-03', '18-24', true, 'default', 'default', 3, 120, true, true),
  (u_marcus, 'marcusplay', 'Marcus', NULL, 'Gaming, arcades, and late-night food runs. Night owl energy.', '1997-12-25', '25-30', true, 'dark', 'default', 5, 90,  true, true),
  (u_zoe,    'zoe.wanders','Zoe',    NULL, 'Solo traveler who moved to SF for the fog and stayed for the food.', '2000-06-14', '18-24', true, 'default', 'default', 3, 60,  true, true),
  (u_dani,   'dani_chill', 'Dani',   NULL, 'Yoga, thrifting, and plant-based restaurants. Always chill.', '1999-02-27', '18-24', true, 'soft', 'leaf', 3, 75,  true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Profile Interests
-- ============================================================
INSERT INTO profile_interests (user_id, interest) VALUES
  (u_maya,   'coffee'), (u_maya,   'walk'),     (u_maya,   'photos'),
  (u_jay,    'basketball'), (u_jay, 'boba'),    (u_jay,    'food'),
  (u_lena,   'photos'),  (u_lena,  'thrift'),   (u_lena,   'walk'),
  (u_chris,  'gym'),     (u_chris, 'food'),     (u_chris,  'basketball'),
  (u_noor,   'library'), (u_noor,  'board_games'), (u_noor, 'open_mic'),
  (u_eli,    'walk'),    (u_eli,   'gym'),       (u_eli,    'coffee'),
  (u_priya,  'study'),   (u_priya, 'boba'),      (u_priya,  'library'),
  (u_marcus, 'gaming'),  (u_marcus,'food'),      (u_marcus, 'basketball'),
  (u_zoe,    'food'),    (u_zoe,   'photos'),    (u_zoe,    'walk'),
  (u_dani,   'thrift'),  (u_dani,  'coffee'),    (u_dani,   'open_mic')
ON CONFLICT (user_id, interest) DO NOTHING;

-- ============================================================
-- Points Wallets (varied balances 100-450 HP)
-- ============================================================
INSERT INTO points_wallets (user_id, balance, lifetime_earned, weekly_score, current_streak, longest_streak, reliability_score)
VALUES
  (u_maya,   280, 380, 55, 4, 7,  95),
  (u_jay,    450, 550, 80, 7, 12, 98),
  (u_lena,   175, 250, 30, 2, 5,  88),
  (u_chris,  320, 420, 60, 5, 9,  92),
  (u_noor,   130, 200, 20, 1, 3,  85),
  (u_eli,    210, 310, 45, 3, 6,  90),
  (u_priya,  390, 490, 70, 6, 10, 96),
  (u_marcus, 100, 150, 10, 0, 2,  75),
  (u_zoe,    265, 365, 50, 4, 8,  93),
  (u_dani,   185, 285, 35, 2, 4,  87)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Active Availability Sessions
-- San Francisco coordinates jittered per user
-- (37.77 lat, -122.41 lng is approx downtown SF)
-- ============================================================
INSERT INTO availability_sessions (user_id, status, available_for, status_note, radius_miles, location, approximate_geohash, expires_at)
VALUES
  (u_maya,   'active', ARRAY['coffee','walk'],        'Down for a walk or coffee run ☕',    3,
    ST_SetSRID(ST_MakePoint(-122.4150, 37.7765), 4326)::geography, '9q8yy',
    now() + interval '90 minutes'),

  (u_jay,    'active', ARRAY['basketball','boba'],     'At the courts, then boba after? 🏀',  5,
    ST_SetSRID(ST_MakePoint(-122.4080, 37.7720), 4326)::geography, '9q8yx',
    now() + interval '2 hours'),

  (u_lena,   'active', ARRAY['photos','thrift'],       'Golden hour photo hunt 📸',            4,
    ST_SetSRID(ST_MakePoint(-122.4200, 37.7800), 4326)::geography, '9q8yz',
    now() + interval '2 hours'),

  (u_chris,  'active', ARRAY['gym','food'],            'Gym then food — who''s joining?',      3,
    ST_SetSRID(ST_MakePoint(-122.4100, 37.7750), 4326)::geography, '9q8yy',
    now() + interval '75 minutes'),

  (u_noor,   'active', ARRAY['library','board_games'], 'At the library, game café later?',     2,
    ST_SetSRID(ST_MakePoint(-122.4165, 37.7785), 4326)::geography, '9q8yy',
    now() + interval '3 hours'),

  (u_eli,    'active', ARRAY['walk','coffee'],         'Exploring the Embarcadero 🌉',         4,
    ST_SetSRID(ST_MakePoint(-122.3950, 37.7975), 4326)::geography, '9q8z0',
    now() + interval '1 hour'),

  (u_priya,  'active', ARRAY['study','boba'],          'Study session + boba break welcome 📚', 3,
    ST_SetSRID(ST_MakePoint(-122.4190, 37.7840), 4326)::geography, '9q8yz',
    now() + interval '2 hours 30 minutes'),

  (u_zoe,    'active', ARRAY['food','walk'],           'Exploring a new neighborhood!',        3,
    ST_SetSRID(ST_MakePoint(-122.4130, 37.7870), 4326)::geography, '9q8yz',
    now() + interval '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Host Profile (for mock events)
-- ============================================================
INSERT INTO host_profiles (id, owner_user_id, host_name, host_type, description, verified, is_pro)
VALUES
  (host_id_1, u_marcus, 'SF Community Hangouts', 'community',
   'Your go-to for casual, fun, and safe community events around San Francisco.', true, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Host Events
-- ============================================================
INSERT INTO host_events (host_id, title, description, category, start_time, end_time, general_location, location, capacity, visibility, price_label, safety_notes)
VALUES
  (host_id_1,
   'Boba Study Night',
   'Bring your laptop or textbook and grind alongside fellow students at Boba Guys in the Mission. Good vibes, better drinks.',
   'study',
   now() + interval '3 days 18:00',
   now() + interval '3 days 21:00',
   'Mission District, San Francisco',
   ST_SetSRID(ST_MakePoint(-122.4185, 37.7630), 4326)::geography,
   20, 'public', 'free',
   'Public café environment. Meet at the entrance.'),

  (host_id_1,
   'Pickup Basketball Run',
   'Casual pickup games at Dolores Park courts. All skill levels welcome — show up and run.',
   'basketball',
   now() + interval '2 days 10:00',
   now() + interval '2 days 13:00',
   'Dolores Park, San Francisco',
   ST_SetSRID(ST_MakePoint(-122.4267, 37.7596), 4326)::geography,
   16, 'public', 'free',
   'Outdoor public park. Bring water and wear sunscreen.'),

  (host_id_1,
   'Downtown Photo Walk',
   'Meet at Ferry Building and wander toward the Bay Bridge. Bring any camera — phone cameras totally welcome.',
   'photos',
   now() + interval '4 days 17:00',
   now() + interval '4 days 19:30',
   'Embarcadero, San Francisco',
   ST_SetSRID(ST_MakePoint(-122.3939, 37.7955), 4326)::geography,
   15, 'public', 'free',
   'Outdoor walk along public waterfront. Meet at Ferry Building clock tower.'),

  (host_id_1,
   'Board Game Hangout',
   'Monopoly Deal, Codenames, Ticket to Ride — bring your favorites or borrow from the host. Weekly casual session.',
   'board_games',
   now() + interval '5 days 19:00',
   now() + interval '5 days 22:30',
   'Castro District, San Francisco',
   ST_SetSRID(ST_MakePoint(-122.4348, 37.7609), 4326)::geography,
   12, 'public', 'free',
   'Meet at the café entrance. Public venue with staff present.'),

  (host_id_1,
   'Open Mic Chill Night',
   'Drop-in open mic at a cozy Mission café. Performers and listeners both welcome. Spoken word, music, comedy — all good.',
   'open_mic',
   now() + interval '6 days 20:00',
   now() + interval '6 days 22:30',
   'Mission District, San Francisco',
   ST_SetSRID(ST_MakePoint(-122.4175, 37.7590), 4326)::geography,
   40, 'public', 'paid_at_venue',
   'Public café event. Doors open 30 min early. Be respectful of performers.')

ON CONFLICT DO NOTHING;

-- ============================================================
-- Crew: "Core Crew"
-- ============================================================
INSERT INTO crews (id, name, owner_id, is_plus)
VALUES (crew_id_1, 'Core Crew', u_jay, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO crew_members (crew_id, user_id, role)
VALUES
  (crew_id_1, u_jay,    'owner'),
  (crew_id_1, u_maya,   'admin'),
  (crew_id_1, u_chris,  'member'),
  (crew_id_1, u_eli,    'member'),
  (crew_id_1, u_priya,  'member')
ON CONFLICT (crew_id, user_id) DO NOTHING;

END $$;
