# Ghost in the Repo — User System Implementation Plan

> This plan adds authentication, user profiles, progress tracking, and a badge/achievement system to the existing static platform. It builds on top of Phases 1–10 (complete) and should be executed before or alongside Phase 11 (Search, SEO & Polish).

---

## Stack Additions

| Layer | Choice |
|---|---|
| Auth & Database | Supabase (PostgreSQL + Auth + RLS) |
| Auth Providers | Email/password, Google OAuth, Apple Sign-In |
| Auth Library | `@supabase/ssr` (PKCE flow, cookie-based sessions) |
| Form Validation | `zod` |
| Backend / Auth / DB | Supabase (replaces "None — fully static") |

---

## Breaking Change: Static Export Removal

The current `next.config.ts` sets `output: "export"` for fully static builds. This **must be removed** because Supabase auth requires:

- API routes (OAuth callback, session management)
- Middleware (token refresh on every request)
- Server-side cookie access via `cookies()` API

**Impact:** Can no longer deploy to pure static hosts (S3, GitHub Pages). Vercel and Netlify still work. All existing static page generation (`generateStaticParams`) continues to work — content pages remain pre-rendered at build time.

---

## Phase 12 — Supabase Setup & Auth Foundation

**Deliverable:** Working login/signup with email, Google, and Apple. Session persists across page loads. Middleware refreshes tokens.

### 12.1 Infrastructure Setup

- Create Supabase project
- Add environment variables to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- Remove `output: "export"` from `next.config.ts`
- Install dependencies:
  ```
  npm install @supabase/supabase-js @supabase/ssr zod
  ```

### 12.2 Supabase Client Utilities

Create `src/lib/supabase/`:

| File | Purpose |
|---|---|
| `client.ts` | Browser client via `createBrowserClient()` |
| `server.ts` | Server client via `createServerClient()` with cookie handlers |
| `middleware.ts` | Middleware client for token refresh |

### 12.3 Middleware

Create `src/middleware.ts`:
- Match all routes except static assets (`_next/static`, images, favicon)
- Call `supabase.auth.getUser()` to refresh expired tokens
- Pass updated cookies on both request and response
- **Do NOT block** unauthenticated users — the site remains fully readable without login

### 12.4 OAuth Provider Setup

**Google OAuth:**
1. Google Cloud Console → Create OAuth 2.0 Web Client
2. Authorized redirect URI: `https://<project-id>.supabase.co/auth/v1/callback`
3. Scopes: `openid`, `email`, `profile`
4. Enter Client ID + Secret in Supabase Dashboard → Auth → Providers → Google

**Apple Sign-In:**
1. Apple Developer Console ($99/yr required)
2. Create App ID with "Sign in with Apple" capability
3. Create Services ID (becomes Client ID)
4. Domain: `<project-id>.supabase.co` (no protocol, no trailing slash)
5. Redirect URL: `https://<project-id>.supabase.co/auth/v1/callback`
6. Create signing key, download `.p8` file
7. Generate client secret JWT (must be **regenerated every 6 months**)
8. Register email relay sources for "Hide My Email" users
9. Enter all credentials in Supabase Dashboard → Auth → Providers → Apple

**Apple quirks to handle:**
- Full name only sent on first auth — capture immediately and store
- No localhost support — use ngrok or real domain for dev testing
- Secret key expires every 6 months — set calendar reminder

### 12.5 Auth Pages

| Route | Component | Notes |
|---|---|---|
| `/auth/login` | Login form | Email/password + Google + Apple buttons |
| `/auth/signup` | Signup form | Email/password + Google + Apple buttons |
| `/auth/callback/route.ts` | API route | PKCE code exchange via `exchangeCodeForSession()` |
| `/auth/forgot-password` | Password reset | Supabase magic link flow |

**Auth UI design:**
- Dark card centered on abyss background
- Ghost logo at top (wispy state)
- Spectral glow on focused inputs
- Social buttons with provider icons
- Match existing design system (CSS Modules, custom properties)
- Fraunces for headings, Epilogue for body text

### 12.6 Navbar Auth Integration

Modify `Navbar.tsx`:
- **Logged out:** "Sign In" ghost-button in nav
- **Logged in:** User avatar (or ghost icon fallback) + dropdown:
  - Profile
  - Settings
  - Sign Out

### 12.7 Files Created/Modified

```
NEW:
  src/lib/supabase/client.ts
  src/lib/supabase/server.ts
  src/lib/supabase/middleware.ts
  src/middleware.ts
  src/app/auth/login/page.tsx
  src/app/auth/signup/page.tsx
  src/app/auth/callback/route.ts
  src/app/auth/forgot-password/page.tsx
  src/components/auth/LoginForm/LoginForm.tsx
  src/components/auth/LoginForm/LoginForm.module.css
  src/components/auth/SignupForm/SignupForm.tsx
  src/components/auth/SignupForm/SignupForm.module.css
  src/components/auth/SocialAuthButtons/SocialAuthButtons.tsx
  src/components/auth/SocialAuthButtons/SocialAuthButtons.module.css

MODIFIED:
  next.config.ts                    (remove output: "export")
  package.json                      (add supabase, zod)
  src/components/layout/Navbar/     (add auth state, user menu)
  src/app/layout.tsx                (initialize session context)
```

---

## Phase 13 — Database Schema & User Profiles

**Deliverable:** User profile page with stats dashboard, ghost evolution, and account settings.

### 13.1 Database Schema (Supabase SQL)

```sql
-- Extended user profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  ghost_level INT NOT NULL DEFAULT 1,
  spectral_density INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', 'ghost-' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous Ghost'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'codex', 'cheatsheet', 'path')),
  content_slug TEXT NOT NULL,
  domain_slug TEXT,
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_slug)
);

-- Bookmarks
CREATE TABLE user_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'codex', 'cheatsheet')),
  content_slug TEXT NOT NULL,
  domain_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_type, content_slug)
);

-- Daily visit tracking (for streaks)
CREATE TABLE user_daily_visits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_visit_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, visit_date)
);

-- Activity log (for badge unlock checks)
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges earned
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_domain ON user_progress(user_id, domain_slug);
CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_visits_user ON user_daily_visits(user_id, visit_date);
CREATE INDEX idx_activity_user ON user_activity(user_id, activity_type, created_at);
CREATE INDEX idx_badges_user ON user_badges(user_id);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own visits" ON user_daily_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON user_daily_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
```

### 13.2 Profile Page (`/profile`)

Implement the wireframe from `03-page-layouts.md`:
- Ghost mascot at current evolution level (1–10)
- Username + level title (e.g., "Intermediate Ghost")
- Spectral Density meter (SVG circular arc)
- Stats grid: Topics completed, Cheatsheets viewed, Paths started, Streak days
- Per-domain progress breakdown with percentage bars

**Ghost Evolution Levels:**
| Level | Range | Visual |
|---|---|---|
| 1 | 0–10% | Wispy outline, 20% opacity |
| 2 | 10–20% | Slightly more defined, 35% opacity |
| 3 | 20–35% | Defined shape, 50% opacity |
| 4 | 35–45% | Solid outline, 60% opacity |
| 5 | 45–55% | Solid with faint glow |
| 6 | 55–65% | Brighter glow, violet tint |
| 7 | 65–75% | Strong violet aura |
| 8 | 75–85% | Multi-color spectral glow |
| 9 | 85–95% | Near-full chromatic |
| 10 | 95–100% | Full chromatic, all spectral colors, intense glow |

### 13.3 Settings Page (`/profile/settings`)

- Edit display name, username, bio
- Upload avatar (Supabase Storage)
- Change password (email/password users)
- Connected accounts (show Google/Apple links)
- Delete account

### 13.4 Files Created/Modified

```
NEW:
  src/app/profile/page.tsx
  src/app/profile/settings/page.tsx
  src/components/profile/ProfileHeader/ProfileHeader.tsx
  src/components/profile/ProfileHeader/ProfileHeader.module.css
  src/components/profile/SpectralDensityMeter/SpectralDensityMeter.tsx
  src/components/profile/SpectralDensityMeter/SpectralDensityMeter.module.css
  src/components/profile/StatsGrid/StatsGrid.tsx
  src/components/profile/StatsGrid/StatsGrid.module.css
  src/components/profile/DomainProgress/DomainProgress.tsx
  src/components/profile/DomainProgress/DomainProgress.module.css
  src/components/profile/GhostEvolution/GhostEvolution.tsx
  src/components/profile/GhostEvolution/GhostEvolution.module.css
  src/components/profile/SettingsForm/SettingsForm.tsx
  src/components/profile/SettingsForm/SettingsForm.module.css
  src/lib/db/queries.ts
  src/lib/db/types.ts

MODIFIED:
  src/types/content.ts              (add User, Progress, Badge types)
```

---

## Phase 14 — Progress Tracking & Content Integration

**Deliverable:** Users can mark topics/articles as complete, see progress on content pages, and reading progress persists to the database.

### 14.1 Progress API

Server Actions or API routes:
- `POST /api/user/progress` — upsert progress (content_type, content_slug, progress_pct)
- `GET /api/user/progress` — get all progress for current user
- `GET /api/user/progress?domain=fundamentals` — get progress for a domain

### 14.2 Content Page Integration

**Topic pages** (`/topics/[slug]/[topic]`):
- "Mark as Complete" button at bottom of content
- Bookmark toggle icon in header
- Progress indicator if partially read
- Reading progress bar syncs to DB on completion (100% scroll)

**Codex pages** (`/codex/[slug]`):
- Same mark-complete + bookmark pattern
- Reading progress bar syncs to DB

**Cheatsheet pages** (`/cheatsheets/[slug]`):
- "Mark as Reviewed" button
- Bookmark toggle

**Topics hub** (`/topics`):
- Domain cards show progress percentage if logged in
- Completed domains get emerald glow

**Knowledge graph** (`/paths`):
- Node states driven by user progress:
  - `unstarted` → dim, dotted border
  - `in-progress` → amber glow
  - `mastered` → emerald glow, filled

### 14.3 Streak Tracking

- Middleware or layout records daily visit in `user_daily_visits`
- Profile calculates current streak from consecutive dates
- Streak badge checks happen on profile load

### 14.4 Auth Context Provider

Create `src/components/providers/AuthProvider.tsx`:
- Wraps app in user context
- Provides `useUser()` hook for any component
- Handles real-time auth state changes (login/logout)
- Conditionally renders progress UI (hidden when logged out)

### 14.5 Files Created/Modified

```
NEW:
  src/app/api/user/progress/route.ts
  src/app/api/user/bookmarks/route.ts
  src/components/providers/AuthProvider.tsx
  src/components/ui/MarkComplete/MarkComplete.tsx
  src/components/ui/MarkComplete/MarkComplete.module.css
  src/components/ui/BookmarkToggle/BookmarkToggle.tsx
  src/components/ui/BookmarkToggle/BookmarkToggle.module.css

MODIFIED:
  src/app/layout.tsx                          (wrap in AuthProvider)
  src/app/topics/[slug]/[topic]/page.tsx      (add progress UI)
  src/app/codex/[slug]/page.tsx               (add progress UI)
  src/app/cheatsheets/[slug]/page.tsx         (add progress UI)
  src/app/topics/page.tsx                     (domain progress indicators)
  src/app/topics/TopicsClient.tsx             (progress-aware cards)
  src/components/ui/KnowledgeGraph/          (node states from progress)
```

---

## Phase 15 — Badge & Achievement System

**Deliverable:** 28 badges displayed on profile, unlocked automatically based on user activity, with unlock animations.

### 15.1 Badge Definitions

Badges are defined as a static TypeScript registry (no DB table needed for definitions — only `user_badges` tracks which users earned what).

**28 Badges across 6 categories:**

#### Exploration (6 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **First Apparition** | Common | Create an account | `Ghost` |
| **Ecto Trail** | Common | Visit 5 different topic pages | `Footprints` |
| **Spectral Drift** | Uncommon | Visit 1+ topic in 7 different domains | `Compass` |
| **Phantom Surveyor** | Uncommon | Visit all 14 domain hubs | `Binoculars` |
| **Poltergeist Cartographer** | Rare | Interact with nodes from 10+ domains on knowledge graph | `Graph` |
| **The Lurker** | Common | 60+ cumulative minutes reading content | `Eye` |

#### Mastery (7 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **Possessed by Knowledge** | Rare | Complete every topic + cheatsheet in any single domain | `Brain` |
| **Hex Reader** | Uncommon | Complete all content in Terminal & Tools domain | `Terminal` |
| **Phantom Protocol** | Uncommon | Complete all content in Networking domain | `WifiHigh` |
| **Memory Leak** | Uncommon | Complete all content in Operating Systems domain | `Cpu` |
| **Shadow Architect** | Rare | Complete all content in Software Engineering domain | `SquaresFour` |
| **Spectral Cipher** | Rare | Complete all content in Cybersecurity domain | `ShieldCheck` |
| **Neural Phantom** | Rare | Complete all content in AI & ML domain | `Atom` |

#### Codex & Cheatsheets (5 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **Grimoire Initiate** | Common | Read first codex article | `BookOpen` |
| **Tome Collector** | Uncommon | Read 10 codex articles | `Books` |
| **Quick Séance** | Common | View first cheatsheet | `Lightning` |
| **Ectoplasmic Reference** | Uncommon | View 10 different cheatsheets | `Table` |
| **The Necronomicon** | Epic | Read every codex article | `BookBookmark` |

#### Streaks (4 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **Haunt Streak** | Common | 7-day visit streak | `Fire` |
| **Restless Spirit** | Rare | 30-day visit streak | `FireSimple` |
| **The Eternal Haunt** | Epic | 100-day visit streak | `Flame` |
| **Witching Hour** | Common | Visit between 12:00–4:00 AM local time | `Moon` |

#### Completionist (3 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **Full Possession** | Legendary | Complete every piece of content across all 14 domains | `Crown` |
| **Path Walker** | Epic | Complete an entire learning path | `Path` |
| **Astral Collector** | Legendary | Earn all other non-hidden badges | `Trophy` |

#### Hidden (3 badges)

| Badge | Rarity | Unlock Condition | Icon |
|---|---|---|---|
| **Glitch in the Matrix** | Epic | Click the ghost logo 13 times | `Bug` |
| **The Original Ghost** | Legendary | Be one of the first 100 accounts created | `Skull` |
| **Reverse Engineer** | Common | Read all Hacker Mindset content in reverse order | `MagnifyingGlass` |

### 15.2 Rarity Visual Design

| Rarity | Color Variable | Glow | Card Treatment |
|---|---|---|---|
| Common | `--ghost-white` | None | Subtle border |
| Uncommon | `--spectral-3` (emerald) | Faint | Light emerald border |
| Rare | `--spectral-2` (sky) | Medium | Sky border + faint glow |
| Epic | `--spectral-1` (violet) | Strong | Violet border + glow + subtle pulse |
| Legendary | `--spectral-5` (amber) | Intense | Amber border + glow + particle effect |

### 15.3 Badge Unlock Engine

Create `src/lib/badges/engine.ts`:
- Takes user activity/progress data as input
- Checks each badge's unlock condition
- Returns newly unlocked badges
- Called after every progress update, page visit, or activity log write
- Newly unlocked badges → insert into `user_badges` + trigger unlock animation

### 15.4 Badge Unlock Animation

Per `05-motion-and-interactions.md` mastery milestone spec:
- Screen vignette darkens (400ms)
- Badge icon materializes with particle burst (600ms)
- Badge name + rarity text fades in
- "UNLOCKED" label with spectral glow
- Auto-dismisses after 2.5s or on click
- Hidden badges show "???" before unlock, revealed on earn

### 15.5 Profile Badge Display

- Badge grid on profile page, grouped by category
- Earned badges: full color + icon + name
- Unearned badges: dimmed silhouette, "???" for hidden badges
- Hover/tap shows description + unlock condition (except hidden)
- Progress indicator on partially-met badges (e.g., "3/7 domains visited")

### 15.6 Files Created/Modified

```
NEW:
  src/lib/badges/definitions.ts         (28 badge definitions)
  src/lib/badges/engine.ts              (unlock condition checker)
  src/lib/badges/types.ts               (Badge, BadgeRarity, BadgeCategory)
  src/components/profile/BadgeGrid/BadgeGrid.tsx
  src/components/profile/BadgeGrid/BadgeGrid.module.css
  src/components/profile/BadgeCard/BadgeCard.tsx
  src/components/profile/BadgeCard/BadgeCard.module.css
  src/components/ui/BadgeUnlockOverlay/BadgeUnlockOverlay.tsx
  src/components/ui/BadgeUnlockOverlay/BadgeUnlockOverlay.module.css

MODIFIED:
  src/app/profile/page.tsx              (add badge grid section)
  src/components/providers/AuthProvider.tsx (badge unlock checks)
```

---

## Phase 16 — Polish & Integration

**Deliverable:** All user features work cohesively. Empty states, loading states, error handling, and edge cases addressed.

### 16.1 Empty States

Per `04-components.md`:
- Profile with no progress: wispy ghost + "Start exploring to build your spectral density"
- Badge grid with no badges: "Your collection awaits. Start reading to earn your first badge."
- Bookmarks empty: "Nothing saved yet. Bookmark topics to find them here."

### 16.2 Loading States

- Profile page: skeleton cards with spectral shimmer
- Progress bars: animate from 0 to actual value on mount
- Badge grid: ghost silhouettes pulse while loading

### 16.3 Optimistic Updates

- "Mark Complete" button updates immediately, syncs to DB in background
- Bookmark toggle responds instantly
- Badge unlock checks run client-side first for instant feedback

### 16.4 Graceful Degradation

- All content remains fully readable without login
- Progress UI hidden (not broken) when logged out
- "Sign in to track your progress" callout on content pages (non-intrusive)

### 16.5 Files Modified

```
MODIFIED:
  src/app/topics/[slug]/[topic]/page.tsx  (auth callout)
  src/app/codex/[slug]/page.tsx           (auth callout)
  src/components/ui/Callout/              (new "sign in" variant)
```

---

## Dependency Map

```
Phase 12 (Auth Foundation)
  └── Phase 13 (DB Schema & Profiles)
        ├── Phase 14 (Progress Tracking)
        │     └── Phase 15 (Badges)
        └── Phase 16 (Polish)
              └── Phase 11 (Search, SEO & Final Polish)
```

Phase 11 moves to the end since it includes final SEO and polish that should account for all new pages.

---

## Environment Requirements

| Requirement | Notes |
|---|---|
| Supabase project | Free tier works for development |
| Google Cloud Console | OAuth 2.0 credentials (free) |
| Apple Developer Account | $99/year — required for Sign in with Apple |
| Vercel or Netlify | For deployment (can't use static-only hosts anymore) |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
