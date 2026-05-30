# Hangout

**See who's actually free.**

Hangout is a social mobile app for spontaneous, real-life plans. Toggle available, discover nearby people who are free right now, and drop a real plan — no endless "wyd" threads, no DM cold-starts.

---

## What is Hangout?

Hangout removes the friction from making plans. Users toggle their availability, choose what they're down for (coffee, gym, boba, walk, etc.), and instantly see nearby people who are also available. A request goes out, gets accepted, and both people meet up. Simple.

Key principles:
- **Approximate location only** — no one ever sees your exact coordinates
- **Plans before DMs** — messaging is only unlocked after a hangout request is accepted
- **Meet in public** — the AI planner favors public venues
- **Bail anytime** — one tap goes invisible and ends any session, no penalty
- **Report is always free** — block/report are never paywalled

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native via Expo (~52) |
| Router | Expo Router v4 (file-based) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) |
| Animation | React Native Reanimated + Animated API |
| Location | expo-location |
| Camera | expo-camera (QR verification) |
| Storage | @react-native-async-storage/async-storage |
| Icons | @expo/vector-icons (Ionicons) |
| Gradients | expo-linear-gradient |
| Language | TypeScript (strict) |

---

## Project Structure

```
hangout/
├── app/
│   ├── _layout.tsx              # Root layout, auth gate
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack navigator
│   │   ├── welcome.tsx          # Landing screen
│   │   ├── age-gate.tsx         # Age verification
│   │   ├── sign-up.tsx          # Account creation
│   │   ├── sign-in.tsx          # Sign in
│   │   ├── onboarding-profile.tsx   # Step 1/3
│   │   ├── onboarding-interests.tsx # Step 2/3
│   │   └── onboarding-safety.tsx    # Step 3/3
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar
│       ├── index.tsx            # Nearby (Agent 2)
│       ├── map.tsx              # Map (Agent 2)
│       ├── inbox.tsx            # Inbox (Agent 3)
│       ├── crews.tsx            # Crews (Agent 3)
│       ├── host.tsx             # Host (Agent 4)
│       ├── points.tsx           # Points (Agent 4)
│       └── profile.tsx          # Profile (Agent 4)
├── components/ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Pill.tsx
│   ├── Toggle.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Screen.tsx
│   ├── Modal.tsx
│   ├── BottomSheet.tsx
│   ├── EmptyState.tsx
│   ├── GradientGlow.tsx
│   ├── SegmentedControl.tsx
│   └── index.ts
├── lib/
│   ├── types.ts        # All shared TypeScript types
│   ├── constants.ts    # App-wide constants
│   ├── supabase.ts     # Supabase client
│   └── location.ts     # Location utilities
├── global.css
├── tailwind.config.js
├── babel.config.js
├── tsconfig.json
├── app.json
└── package.json
```

---

## Setup

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- A Supabase project (free tier is fine)

### 1. Clone and install

```bash
cd hangout
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, never expose to client) |
| `EXPO_PUBLIC_MOCK_MODE` | `true` to skip real location, use SF mock data |
| `EXPO_PUBLIC_MOCK_PREMIUM` | `true` to simulate premium entitlements |
| `EXPO_PUBLIC_ENABLE_TEEN_MODE` | `true` to allow 13-17 users (requires extra safety setup) |
| `OPENAI_API_KEY` | For AI plan suggestions (optional) |
| `ANTHROPIC_API_KEY` | Alternative AI provider (optional) |
| `GOOGLE_PLACES_API_KEY` | For venue search/autocomplete (optional) |

### 3. Supabase Setup

Create the following tables in your Supabase project. Enable Row Level Security on all tables.

#### profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  birthdate date,
  age_bracket text,
  is_18_plus boolean default false,
  community_id uuid,
  profile_theme text default 'default',
  map_pin_style text default 'default',
  availability_default_radius_miles int default 3,
  availability_default_duration_minutes int default 60,
  safety_onboarding_completed boolean default false,
  profile_completed boolean default false,
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
```

#### points_wallets
```sql
create table points_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles(id) on delete cascade,
  balance int default 0,
  lifetime_earned int default 0,
  lifetime_spent_or_forfeited int default 0,
  weekly_score int default 0,
  current_streak int default 0,
  longest_streak int default 0,
  reliability_score int default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table points_wallets enable row level security;
create policy "Users can read own wallet" on points_wallets for select using (auth.uid() = user_id);
```

#### availability_sessions
```sql
create table availability_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  status text default 'active',
  available_for text[] default '{}',
  status_note text,
  radius_miles int default 3,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
alter table availability_sessions enable row level security;
```

### 4. Run locally

```bash
# Start Expo dev server
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android
```

---

## Mock Mode

Set `EXPO_PUBLIC_MOCK_MODE=true` to:
- Skip real GPS permission requests
- Use San Francisco (37.7749, -122.4194) as mock location
- Useful for simulator development

Set `EXPO_PUBLIC_MOCK_PREMIUM=true` to:
- Unlock all premium features for testing
- Useful for building premium UI without a paid subscription

---

## Hangout Points System

Hangout uses a reputation-based points system called **Hangout Points (HP)**.

### Key rules

> **Hangout Points are earned-only. They cannot be bought, sold, transferred, or exchanged for cash.**

- Users start with **100 HP** on signup
- **+25 HP** for completing your profile
- **+25 HP** for completing safety onboarding
- **+25 HP base bonus** per completed hangout
- Points are **staked** on hangouts — reliability is on the line
- Cancellations and no-shows incur penalties
- A "Respect Rebate" partially compensates users who are stood up

### Reliability Score

Your reliability score (0–100) is derived from your hangout history:
- 90+ = "Very reliable"
- 70–89 = "Pretty reliable"
- 50–69 = "Somewhat reliable"
- Below 50 = "Unreliable"

### Why points, not money?

HP creates accountability without any financial transaction. There's no gambling, no purchases, no cash-out. It's a social trust score dressed up as a fun system.

---

## Safety Notes

Hangout is built with safety as a first-class feature:

1. **No exact location sharing** — users only see distance buckets (e.g., "less than a mile"), never coordinates
2. **Teen mode is off by default** — `EXPO_PUBLIC_ENABLE_TEEN_MODE=false` keeps the app 18+ until a verified safe experience is ready for younger users
3. **Safety onboarding is mandatory** — all users must read and acknowledge the 5 safety principles before entering the app
4. **Bail anytime** — the bail button is always accessible during an active hangout; it immediately ends the session with no penalty
5. **Block and report are free** — these safety tools are never locked behind a subscription

---

## Monetization

Hangout uses a subscription model with no dark patterns:

| Tier | Features |
|------|----------|
| Free | Core availability, nearby feed, 3 active requests |
| Hangout+ | Unlimited requests, AI plan suggestions, premium map pins, advanced filters |
| Crew+ | Group hangouts, crew analytics, crew leaderboards |
| Host Pro | Event creation, RSVP management, featured placement |

**What is never paywalled:** block, report, bail, safety tools.

---

## Current Limitations / Known Issues

- Teen mode (13-17) is not yet implemented — these users see a waitlist message
- Real-time nearby feed requires Supabase Realtime + PostGIS extensions (not configured in free tier by default)
- AI plan suggestions (`PlanCard`) require an OpenAI or Anthropic API key
- Google Places autocomplete requires a billing-enabled GCP project
- Push notifications are not yet wired up
- QR code verification flow is stubbed (camera permission is requested but logic is unimplemented)

---

## Next Steps

For agents building on this foundation:
- **Agent 2:** Implement `app/(tabs)/index.tsx` (Nearby feed) and `app/(tabs)/map.tsx`
- **Agent 3:** Implement `app/(tabs)/inbox.tsx` and `app/(tabs)/crews.tsx`
- **Agent 4:** Implement `app/(tabs)/profile.tsx`, `app/(tabs)/points.tsx`, and `app/(tabs)/host.tsx`

Import shared types from `@/lib/types`, constants from `@/lib/constants`, and UI components from `@/components/ui`.
