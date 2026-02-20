# Ghost in the Repo — Implementation Plan

> Phases are sized to be the largest coherent unit of work Claude Code can execute with full accuracy. Each phase has a clear deliverable, no unresolved dependencies from unfinished phases, and produces a runnable state of the app.
>
> **Architecture decision:** No database, no auth, no progress tracking. The site is a fully static, read-only reference platform deployed with zero backend.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules + CSS Custom Properties |
| Animations | CSS-first + Framer Motion (graph only) |
| Syntax highlighting | Shiki (custom "Spectral" theme) |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| Search | Fuse.js (client-side) |
| Knowledge Graph | D3.js force simulation |
| Fonts | Google Fonts (self-hosted via `next/font/google`) |
| Content | MDX via `@next/mdx` + `gray-matter` |
| Backend / Auth / DB | None — fully static |

---

## Phase 1 — Project Foundation & Design System

**Deliverable:** A running Next.js 16 app with every design token, font, and global style in place. No components yet — just the canvas.

### Install & configure
- Init Next.js 16 with App Router, TypeScript, CSS Modules
- Install all dependencies:
  ```
  @phosphor-icons/react
  fuse.js
  d3
  @types/d3
  framer-motion
  shiki
  @next/mdx
  gray-matter
  ```
- Configure `next.config.ts` for MDX support

### Folder structure
```
src/
  app/
    layout.tsx              ← root layout: fonts, metadata, body class
    globals.css             ← all CSS custom properties + reset + base
    page.tsx                ← landing page (empty shell)
  components/
    ui/                     ← atomic components (Phase 2)
    layout/                 ← navbar, footer, page wrappers (Phase 3)
    animations/             ← particle field, ghost, reveals (Phase 4)
  lib/
    data/                   ← content registry and access functions (Phase 5)
    shiki/                  ← Spectral theme config
  types/
    content.ts              ← all TypeScript interfaces
public/
  fonts/                    ← self-hosted font files
docs/
  research/                 ← source of truth for content
```

### `globals.css` — full design token set
All CSS custom properties from `02-design-system.md`:
- Void/surface/float background scale (`--void` through `--surface-float`)
- Border scale (`--border-ghost` through `--border-medium`)
- Text scale (`--text-primary` through `--text-inverse`)
- Spectral accent palette (`--spectral-1` through `--spectral-5`)
- Glow variants (`--glow-violet`, `--glow-sky`, `--glow-emerald`)
- `--ghost-white`
- Spacing scale (`--space-1` through `--space-32`)
- Border radius scale (`--radius-sm` through `--radius-full`)
- Font family variables (`--font-display`, `--font-ui`, `--font-body`, `--font-mono`)
- Type scale variables (display, UI, body, mono sizes)
- Easing curve variables (`--ease-standard`, `--ease-enter`, `--ease-exit`, `--ease-spring`, `--ease-drift`)
- Timing reference comments

### Background texture
Apply layered background to `body` in `globals.css`:
- Base color: `--abyss`
- SVG noise grain (subtle, `0.03` opacity)
- Radial gradient: faint violet glow at top center
- Radial gradient: deep blue warmth at bottom

### Elevation utility classes
`.elevation-0` through `.elevation-3` and `.glow-violet` as defined in `02-design-system.md`.

### Font setup
Self-host via `next/font/google` in `layout.tsx`:
- Fraunces (variable: `opsz` + `wght`, italic variant)
- Syne (wght 400–800)
- Epilogue (wght 100–900, italic)
- JetBrains Mono (wght 100–800, italic)

Apply as CSS variables on `<html>` element.

### Shiki — Spectral theme
Create `src/lib/shiki/spectral-theme.ts` with the full "Spectral" token color map from `02-design-system.md`. Export a configured Shiki highlighter instance.

### TypeScript types (`src/types/content.ts`)
```ts
interface Domain             // id, slug, label, icon, description, color
interface Topic              // id, slug, domainSlug, title, subtopics
interface Subtopic           // id, slug, topicSlug, title, content path
interface CheatsheetSection  // title, entries: CheatsheetEntry[]
interface CheatsheetEntry    // command, description, note?
interface Cheatsheet         // domainSlug, sections: CheatsheetSection[]
interface CodexArticle       // slug, title, domain, readingTime, publishedAt, mdxPath
interface LearningPath       // id, name, description, nodes: PathNode[], edges: PathEdge[]
interface PathNode           // domainSlug, label
interface PathEdge           // from, to, type: 'prerequisite' | 'related'
```

### Icon map (`src/lib/domain-icons.ts`)
Maps all 14 domains to Phosphor icon components:
```ts
fundamentals          → PhCircuitBoard
operating-systems     → PhCpu
terminal-and-tools    → PhTerminalWindow
networking            → PhNetwork
systems-programming   → PhGear
databases             → PhDatabase
web-development       → PhGlobe
software-engineering  → PhBlueprint
cloud-devops          → PhCloud
cybersecurity         → PhShieldCheck
ai-ml                 → PhBrain
mobile-dev            → PhDeviceMobile
languages             → PhCodeBlock
hacker-mindset        → PhBug
```

---

## Phase 2 — Atomic UI Components

**Deliverable:** Every reusable leaf component rendered in a `/dev` route for visual inspection. No pages yet.

### Ghost SVG Logo (`components/ui/GhostLogo/`)
- SVG from `04-components.md` as a React component
- Props: `size` — no level/evolution, fixed visual state at full opacity
- CSS animations: `ghost-float` (4s infinite drift with micro-rotation), `blink` on eyes (6s, 0.12s offset between eyes so they don't sync perfectly)
- Hover: scale 1.06, violet drop-shadow intensifies (`300ms --ease-spring`)
- Click: scale 0.95 snap (`100ms`)

### Buttons (`components/ui/Button/`)
- `ButtonPrimary` — violet background, shimmer sweep on hover, lift + glow
- `ButtonSecondary` — ghost/outline, violet border + bg tint on hover
- `ButtonIcon` — square, 36px, transparent background
- All: Syne 600, correct padding, border-radius `--radius-md`

### Tags & Badges (`components/ui/Tag/`)
- `Tag` — topic label style (violet tint, uppercase, letter-spaced)
- `DifficultyBadge` — `BEGINNER` (emerald) / `INTERMEDIATE` (amber) / `ADVANCED` (violet) / `ARCANE` (pink)

### Tooltip (`components/ui/Tooltip/`)
- Portal-rendered, `tooltip-in` CSS animation
- Frosted glass background (`--surface-float` + `backdrop-filter: blur(8px)`)

### Callout Blocks (`components/ui/Callout/`)
Four variants: `key-insight` (sky), `gotcha` (amber), `mental-model` (violet), `deep-dive` (pink)
- Bordered box, icon + label header, body text
- Used inside Codex MDX content

### Code Block (`components/ui/CodeBlock/`)
- Header bar: language label + `[copy]` `[wrap]` buttons
- Body: Shiki-rendered HTML with Spectral theme
- Copy button: icon swap (copy → check, 150ms), emerald flash, 2s revert
- `--void` background, `--border-ghost` border, `--radius-lg`

### Cheatsheet Entry & Section (`components/ui/Cheatsheet/`)
- `CheatsheetEntry` — CSS grid: `command` (JetBrains Mono, sky) + `description` (Epilogue, secondary)
- Row hover: sky-tinted background, command brightens to ghost-white
- `CheatsheetSection` — section header (Syne uppercase, violet) + divider + entries
- Card hover: border-color lifts, shadow deepens

### Topic Card — three sizes (`components/ui/TopicCard/`)
- `TopicCardSm` — icon + title + subtopic count, `180×200px`
- `TopicCardMd` — icon + title + count + 3 preview subtopics
- `TopicCardLg` — full description + subtopic list (no progress bar)
- All: elevation-1 rest → elevation-2 hover; icon shimmer on hover; arrow appears bottom-right

### Empty State (`components/ui/EmptyState/`)
- Ghost SVG (animated float, full opacity)
- Message + CTA button

### `/dev` route
`app/dev/page.tsx` — renders every component above on a dark background for visual QA. Not linked from nav, deleted in Phase 11.

---

## Phase 3 — Layout Shell & Navigation

**Deliverable:** The full site shell — navbar, footer, page wrapper — visible on every route. Search overlay functional (index not yet populated).

### Root Layout (`app/layout.tsx`)
- Applies fonts, `--abyss` background
- Wraps content in `<PageShell>` (provides navbar + footer)
- Sets up global metadata defaults (title template, OG defaults)

### Navbar (`components/layout/Navbar/`)
- Structure: `[ghost logo + wordmark] ··· [paths] [topics] [codex] ··· [search icon]`
- No profile link (no auth)
- **Transparent state:** on load for hero pages (controlled via a `heroPage` context flag set in the landing page)
- **Frosted state:** after scroll threshold OR on all non-hero pages — `rgba(8,12,21,0.8)`, `backdrop-filter: blur(24px)`, 1px bottom border `--border-ghost`
- Scroll listener: transitions between states over 200ms
- Active route underline: 2px violet, glow `--glow-violet`
- Mobile: wordmark hidden, ghost icon only; full nav collapses to hamburger → bottom drawer (Framer Motion slide up, 300ms)

### Search Overlay (`components/layout/Search/`)
- Triggered by search icon button or `Cmd+K` / `Ctrl+K`
- Full-screen backdrop: `rgba(5,8,15,0.92)` + `backdrop-filter: blur(8px)`
- Input: `--surface-raised`, 1.25rem, Epilogue, violet focus ring
- Recent searches: stored in localStorage (search history only, not progress)
- Results: domain icon + title + category path, stagger-in 20ms per item
- Keyboard: `↑↓` navigate, `Enter` open, `Escape` close
- Fuse.js wired up but searches empty index (populated in Phase 5)
- 300ms ease-out entrance from top

### Footer (`components/layout/Footer/`)
- Minimal: ghost logo + tagline "KNOW THE MACHINE. HAUNT IT." + nav links
- Dark, no border, blends into page background

### Page Transition Wrapper (`components/layout/PageTransition/`)
- Framer Motion `AnimatePresence` + `motion.div` on route change
- Enter: opacity 0→1, translateY 12px→0, blur(4px)→0, 350ms `--ease-enter`
- Exit: opacity 1→0, translateY 0→-8px, 200ms `--ease-exit`
- 50ms gap between exit and enter

---

## Phase 4 — Animation System

**Deliverable:** Every animation defined and working. Ghost floats. Cards reveal on scroll. The particle field runs.

### CSS keyframes (`globals.css` additions)
All animation keyframes from `05-motion-and-interactions.md`:
- `ghost-float` (5s drift with micro-rotation)
- `blink` (6s, scaleY to 0.1 at 95%)
- `particle-drift` (opacity fade in + translateY up + scale down)
- `shimmer` (200% background-position sweep, 1.5s linear infinite)
- `page-in` / `page-out`
- `tooltip-in`

### Scroll Reveal Hook (`lib/hooks/useScrollReveal.ts`)
- `IntersectionObserver`, threshold 0.15, triggers once (no re-trigger on scroll up)
- Returns ref + `isVisible` boolean
- Default reveal: `opacity: 0; transform: translateY(24px)` → visible
- Section label variant: `translateX(-16px)` → 0, then title fades up 100ms after

### Card Stagger Utility
- CSS `nth-child` delays, 40ms between cards, max 400ms (10th+ animate simultaneously)
- Applied as a CSS Module class on grid containers

### Particle Field (`components/animations/ParticleField/`)
- Vanilla JS + CSS, no canvas
- 30–60 particles, randomized per-particle CSS custom properties: `--size` (1–3px), `--duration` (15–35s), `--delay` (0–20s), `--drift-x` (-40px to +40px), `--particle-opacity` (0.03–0.10)
- On cursor proximity (within 80px): particles drift slightly toward cursor
- On ghost logo hover: burst of 40 particles outward at randomized angles in spectral colors
- React wrapper as a `"use client"` component

### Page Load Sequence (`components/animations/HeroSequence/`)
Orchestrated entrance for the landing page only, using `requestAnimationFrame` delays:
```
  0ms   background texture fades in
100ms   ghost logo (scale 0.85→1.0, blur 8px→0, 400ms --ease-spring)
300ms   headline line 1 (translateY 20px→0, 500ms --ease-enter)
450ms   headline line 2 (same, 150ms after line 1)
600ms   subheading (opacity 0→1, 400ms)
750ms   CTA buttons (translateY 16px→0, 80ms stagger between buttons)
900ms   particle field activates
1200ms  nav links fade in (50ms stagger per link)
```

### Reduced Motion (`globals.css`)
Full `@media (prefers-reduced-motion: reduce)` block: kills all ambient animations, snaps all transitions to instant, keeps meaningful state changes.

---

## Phase 5 — Content Data Layer

**Deliverable:** All 14 research domains parsed, typed, and accessible via data functions. Search index built. Static paths generated.

### Domain registry (`lib/data/domains.ts`)
Array of all 14 `Domain` objects — slug, label, Phosphor icon reference, description, spectral color assignment, subtopic count.

### Research content parser (`lib/data/parser.ts`)
- Reads all markdown files from `docs/research/**/*.md` at build time using `gray-matter`
- Extracts frontmatter (title, domain, difficulty, tags) — research files will need frontmatter added
- Builds typed `Topic` and `Subtopic` objects
- Maps file path → URL slug

### Cheatsheet registry (`lib/data/cheatsheets.ts`)
Structured `Cheatsheet` objects for each domain, hand-authored from the research docs content. Each has `CheatsheetSection[]` with `CheatsheetEntry[]` items (command + description pairs).

### Learning paths (`lib/data/paths.ts`)
Curated `LearningPath[]` defining node sequences and edges:
- **"Systems Foundations"** — Fundamentals → OS → Systems Programming → Networking
- **"Web Engineer"** — Fundamentals → Web Dev → Databases → Software Engineering → Cloud & DevOps
- **"Security & Hacking"** — Networking → Cybersecurity → Hacker Mindset
- **"AI Engineer"** — Fundamentals → Languages → AI/ML → Software Engineering → Cloud & DevOps
- **"Full-Stack"** — Web Dev → Databases → Cloud & DevOps → Software Engineering
- **"Terminal Wizard"** — OS → Terminal & Tools → Systems Programming

Each path defines `nodes[]` (domain slugs in order) and `edges[]` (prerequisite vs. related relationships).

### Search index (`lib/data/search.ts`)
- Build Fuse.js index at runtime from all domains, topics, subtopics, cheatsheet sections
- Configure: `keys: ['title', 'description', 'tags']`, `threshold: 0.3`
- Export as a lazy singleton (computed once on first call, cached)
- Wired into Search Overlay from Phase 3

### Static generation helpers
```ts
getAllDomainSlugs()      → string[]
getDomain(slug)          → Domain
getAllTopics(domainSlug) → Topic[]
getCheatsheet(slug)      → Cheatsheet
getAllCodexArticles()     → CodexArticle[]
getCodexArticle(slug)    → CodexArticle + MDX content
getAllLearningPaths()     → LearningPath[]
```

---

## Phase 6 — Landing Page

**Deliverable:** The full `/` landing page — hero, domain grid, editorial section — with all animations running.

### Hero section
- Full-viewport height, centered layout
- Ghost SVG logo: slightly left of center, `~2deg` rotation, barely-visible ambient glow
- Headline: "Know the" (Fraunces 700, `--ghost-white`) + "Machine." (violet→sky gradient fill) on one line; "Haunt it." (Fraunces 300 italic, 60% opacity) below
- Subheading: Epilogue, `--text-secondary`, `max-width: 480px`
- Two CTAs: `[Start Learning]` (ButtonPrimary → `/topics`) + `[Explore Topics]` (ButtonSecondary → `/topics`)
- `<ParticleField />` rendered behind all content
- `<HeroSequence />` orchestrates entrance animation on mount

### Domain grid section
- Section label: "KNOWLEDGE DOMAINS" (Syne, small caps, `--spectral-1`)
- 6 `TopicCardSm` cards in a 3-column grid — Fundamentals, OS, Networking, Web Dev, Cybersecurity, AI/ML
- Cards stagger in on scroll (30ms between cards via `useScrollReveal`)
- `[View All 14 Domains →]` ButtonSecondary below grid

### Editorial section
- Asymmetric 2-column layout: large Fraunces display quote left (3 col), explanatory Epilogue body right (2 col)
- Quote: "There's a difference between knowing how to use a tool and understanding why it works."
- Full-width `--deep` background section, generous vertical padding

### Responsive
- Mobile: single column, ghost scales down gracefully, grid → 2 col → 1 col, font clamp active

---

## Phase 7 — Topics Hub & Topic Pages

**Deliverable:** `/topics` and `/topics/[slug]` fully functional with all 14 domains browsable.

### Topics Hub (`app/topics/page.tsx`)
**Layout:** 220px fixed sidebar + main grid

**Sidebar:**
- All 14 domains listed: Phosphor icon (20px) + Syne label
- Active domain: left 2px violet border, white label, `--surface` background
- 1px `--border-ghost` dividers between groups
- Desktop: fixed, scrolls with page; Mobile: collapses to horizontal scrollable pill filters above grid

**Main grid:**
- CSS grid `auto-fill`, `minmax(200px, 1fr)`, 24px gap
- Mix of `TopicCardSm`, `TopicCardMd`, `TopicCardLg` (featured domains get Lg, 2-column span)
- Staggered scroll reveal, 40ms between cards
- Filtering by sidebar domain: client-side filter, no page reload, smooth re-sort

### Topic Page (`app/topics/[slug]/page.tsx`)
**Layout:** `max-width: 720px` content column + `240px` sticky TOC column

**Header:**
- `← Back to Topics` breadcrumb link
- Domain category label (Syne, 0.75rem, uppercase, `--spectral-1`)
- Page title (Fraunces 700, 3rem)
- Stats bar: subtopic count · cheatsheet sections · learning paths

**Content column:**
- Overview prose (from domain description)
- Preview of first 2 `CheatsheetSection` cards from the domain
- `[View Full Cheatsheet →]` link
- Subtopic list with `DifficultyBadge` on each entry, links to codex articles where available

**TOC column (sticky, top: 80px):**
- Sections auto-generated from content headings
- Active section highlighted on scroll via `IntersectionObserver`
- `RELATED TOPICS` below — domains connected via learning path edges

**Static generation:**
- `generateStaticParams()` from `getAllDomainSlugs()`
- `generateMetadata()` per domain (title, description, OG)

---

## Phase 8 — Cheatsheet System

**Deliverable:** `/cheatsheets` index + `/cheatsheets/[slug]` for all 14 domains — fully styled, printable, copyable.

### Cheatsheet index (`app/cheatsheets/page.tsx`)
- Grid of domain cards (TopicCardMd) linking to each cheatsheet
- Section label "CHEATSHEETS" + brief description of the format

### Cheatsheet page (`app/cheatsheets/[slug]/page.tsx`)
**Header:**
- `← Back` breadcrumb + domain name + "CHEATSHEET" label (Syne, uppercase)
- `[Print]` and `[Copy All]` icon buttons, top-right

**Body — Sectioned Reference Grid:**
- Two-column CSS grid of `CheatsheetSection` cards
- Each section: Syne uppercase header + divider + `CheatsheetEntry` rows
- All entries sourced from the domain's `Cheatsheet` data object

**Print mode:**
- `[Print]` button toggles `data-print="true"` on `<html>`
- `[data-print="true"]` CSS: white background `#FFFFFF`, black text, all nav/chrome hidden (`display: none`), single-column layout for narrow screens, two-column for wide
- `@media print` mirrors the same rules for actual browser print
- Second click reverts

**Copy All:**
- Serializes all entries as `command  —  description` plain text, one per line
- Copies to clipboard, button flashes emerald for 1.5s

**Static generation:**
- `generateStaticParams()` from `getAllDomainSlugs()`
- `generateMetadata()` per cheatsheet

---

## Phase 9 — Knowledge Graph (`/paths`)

**Deliverable:** Interactive D3.js constellation graph of all learning paths. Draggable, zoomable, hoverable. List view fallback for mobile.

### Page (`app/paths/page.tsx`)
- `[Graph View]` / `[List View]` toggle buttons, top-right
- Graph view default on `lg`+ breakpoints; list view default on `md` and below
- Section header: "LEARNING PATHS" + brief description

### Graph component (`components/ui/KnowledgeGraph/`)
D3.js force-directed simulation (`"use client"`, dynamically imported via `next/dynamic` with `ssr: false`):

**Nodes** — all 14 domains, uniform visual state (no per-user mastery):
- Default: filled circle, `--surface-raised` fill, `--spectral-1` stroke, domain icon + label
- Selected: pulsing violet glow ring (SVG circle expanding outward, 800ms loop)
- Hover: scale 1.15 (200ms `--ease-spring`), hover card appears

**Hover card** (appears adjacent to selected node):
- Domain name + Phosphor icon
- Subtopic count
- Which learning paths include this domain
- `[Open Topic →]` button linking to `/topics/[slug]`

**Edges:**
- Solid lines: prerequisite relationship (do A before B)
- Dashed lines: related topics (useful context)
- On node hover: connected edges highlight in violet with flowing dot animation

**Interactions:**
- Drag nodes to rearrange (`d3-drag`)
- Scroll/pinch to zoom (`d3-zoom`, 0.3×–3×)
- Click node: select + show hover card
- Double-click node: navigate to `/topics/[slug]`
- Click empty space: deselect

**Simulation:**
- `d3.forceSimulation` with `forceLink` (distance 120), `forceManyBody` (strength -300), `forceCenter`
- Runs for ~2s on mount, then `simulation.stop()` — no constant jitter
- Node positions memoized so re-renders don't re-settle

### List view (`components/ui/PathList/`)
- Each `LearningPath` as an expandable accordion card
- Domains listed in sequence with connecting arrows
- Domain icon + name + subtopic count per node
- Accordion expand/collapse with 300ms ease animation

---

## Phase 10 — Codex (Long-form Articles)

**Deliverable:** `/codex` index + `/codex/[slug]` MDX article pages — the full editorial reading experience.

### Codex index (`app/codex/page.tsx`)
- Grid of article cards: `DifficultyBadge` + domain `Tag` + title + reading time
- Filter by domain (client-side)
- Empty state if no articles exist yet (ghost + message)

### Article page (`app/codex/[slug]/page.tsx`)
**Layout:** Editorial single column, `max-width: 680px`, centered, generous vertical padding

**Header:**
- `← Back to Codex` link
- Domain `Tag` + reading time + date in a meta block
- Article title: Fraunces 700, 2.5rem
- Horizontal rule (`--border-soft`)

**Reading progress bar:**
- 1px fixed line at very top of viewport, full width
- `--spectral-1` fill, animates left→right as user scrolls via `scroll` event listener
- At 100%: 400ms glow pulse, then fades out

**MDX rendered with full typography:**
- H1: Fraunces 700, 2.5rem
- H2: Fraunces 600, 1.75rem + 4px left border `--spectral-1` + left padding
- H3: Syne 600, 1.1rem, uppercase, `letter-spacing: 0.08em`
- Body: Epilogue 400, 1.125rem, `line-height: 1.85`, `--text-primary`
- Blockquote: 4px left border `--spectral-1`, `padding-left: 1.5rem`, italic, `--text-secondary`
- Inline code: JetBrains Mono, `--spectral-2`, `rgba(125,211,252,0.08)` background, 3px border-radius
- `<CodeBlock />`: full Shiki + Spectral theme with copy button
- `<Callout />`: all four variants available to MDX authors

**MDX component map** wired in `next.config.ts` (or `mdx-components.tsx`):
Maps `h1`, `h2`, `h3`, `pre`, `code`, `blockquote` to styled components + exports `Callout` for direct use.

**Static generation:**
- `generateStaticParams()` from `getAllCodexArticles()`
- `generateMetadata()` per article

---

## Phase 11 — Search, SEO & Final Polish

**Deliverable:** The complete, production-ready static site. Search fully functional across all content. All metadata correct. Responsive edge cases resolved. Accessibility verified. `/dev` route deleted.

### Search fully wired
- Fuse.js index populated with all 14 domains, all topics, all subtopics, all cheatsheet section titles from Phase 5 data
- Results show: domain icon + result title + breadcrumb path (e.g. "OS → Memory Management")
- Keyboard navigation (`↑↓` navigate, `Enter` open, `Escape` close) tested and working
- "No results" empty state: ghost + "Nothing here yet. Try another search."
- Search history stored in localStorage (5 most recent queries, not content)

### SEO & metadata
- Root `layout.tsx` metadata: title template `"%s | Ghost in the Repo"`, global description, keywords
- `generateMetadata()` implemented in all dynamic routes (topics, cheatsheets, codex, paths)
- OG image: static `/opengraph-image.png` — dark card, ghost logo centered, site name
- Twitter card: `summary_large_image`
- `robots.txt`: allow all
- `sitemap.xml`: Next.js route handler generating all static URLs

### Favicon & icon set
Ghost SVG rendered and exported at:
- `16×16` px → `favicon.ico`
- `32×32` px → `favicon-32.png`
- `180×180` px → `apple-touch-icon.png`
- `192×192` px → `android-chrome-192.png`
- `512×512` px → `android-chrome-512.png`

### Responsive edge case audit
Full manual pass across all breakpoints for every page:
- **Mobile nav:** bottom drawer, ghost icon only, wordmark hidden
- **Topics Hub sidebar:** → horizontal scrollable pill filters on mobile
- **Cheatsheet:** → single column on `sm` and below
- **Knowledge graph:** → forced to list view on `md` and below
- **Topic page TOC:** → sticky pill at bottom of screen on mobile ("Jump to section")
- **Hero:** ghost scales down, font `clamp()` active, particle count halved

### Accessibility audit
- All interactive elements: visible violet focus ring, 2px offset
- All non-decorative images: `alt` attributes
- ARIA roles: `role="navigation"`, `role="main"`, `role="search"`, `role="complementary"`
- Skip-to-content link (visually hidden, visible on focus)
- Knowledge graph SVG: `aria-label`, keyboard-navigable domain list as visually-hidden fallback
- Color contrast: all text/background combinations meet WCAG AA (4.5:1 minimum)
- `lang="en"` on `<html>`

### Performance audit
- All fonts subset and self-hosted via `next/font` (zero layout shift)
- No `next/image` needed (SVG assets only)
- Knowledge graph: `next/dynamic` with `ssr: false` (no server bundle bloat)
- Particle field: `requestAnimationFrame` pool, max 50 particles, paused when tab hidden (`visibilitychange`)
- Only `transform` and `opacity` animated — zero layout-triggering properties
- Lighthouse targets: Performance ≥ 95, Accessibility ≥ 95, Best Practices 100, SEO 100
- `next build` output verified: all routes statically generated, zero serverless functions

### Delete `/dev` route
Remove `app/dev/` before final build.

---

## Phase Dependency Map

```
Phase 1  ←──────────────────── Foundation (no deps)
Phase 2  ← Phase 1
Phase 3  ← Phase 1, 2
Phase 4  ← Phase 1, 2, 3
Phase 5  ← Phase 1              (can build in parallel with 2–4)
Phase 6  ← Phase 1, 2, 3, 4, 5
Phase 7  ← Phase 1, 2, 3, 5
Phase 8  ← Phase 1, 2, 3, 5
Phase 9  ← Phase 1, 2, 3, 4, 5
Phase 10 ← Phase 1, 2, 3, 5
Phase 11 ← ALL
```

**Parallel opportunities once Phases 1–5 are done:**
- Phases 6, 7, 8, 9, and 10 are fully independent of each other
- Phase 5 can be started immediately after Phase 1

---

## Checklist Summary

| # | Phase | Key Deliverable |
|---|---|---|
| 1 | Project Foundation | Next.js 16, all design tokens, Shiki/Spectral, TypeScript types |
| 2 | Atomic Components | Ghost SVG, buttons, cards, cheatsheet entries, code blocks, callouts |
| 3 | Layout Shell | Navbar (transparent/frosted), search overlay, footer, page transitions |
| 4 | Animation System | Particle field, scroll reveals, hero load sequence, reduced motion |
| 5 | Content Data Layer | 14 domains, cheatsheet data, learning paths, Fuse.js index |
| 6 | Landing Page | Hero, domain grid, editorial section, all animations live |
| 7 | Topics Hub & Topic Pages | `/topics` masonry grid + `/topics/[slug]` two-column layout |
| 8 | Cheatsheet System | Reference grid, print mode, copy all |
| 9 | Knowledge Graph | D3.js constellation, hover cards, list view fallback |
| 10 | Codex | MDX articles, editorial layout, reading progress bar |
| 11 | Search, SEO & Polish | Search wired, metadata, favicons, responsive audit, a11y, Lighthouse ≥ 95 |
