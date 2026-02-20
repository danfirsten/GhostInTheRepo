# Ghost in the Repo — Page Layouts

## Layout Philosophy

Every page follows a **deliberate asymmetry** principle: primary content always has breathing room on at least two sides. Navigation never competes with content. The layout itself communicates priority through whitespace and scale.

---

## 01. Landing Page

### Above the Fold

```
┌─────────────────────────────────────────────────────────────────┐
│  ◻ ghost in the repo          paths  topics  codex    [Enter]   │  ← nav: fixed, blur backdrop
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                    ·  ·    ·    · ·  ·                          │  ← particle field (subtle)
│                                                                  │
│              ╔═════════════════════╗                            │
│              ║  👻 (ghost logo)    ║                            │  ← ghost, centered-left
│              ╚═════════════════════╝                            │
│                                                                  │
│         Know the                                                 │
│         Machine.                                                 │  ← Fraunces 700, 7rem
│                                                                  │
│         Haunt it.                                                │  ← Fraunces 300 italic, 7rem
│                                                                  │
│    The complete reference for software engineers               │
│    who want to understand everything, deeply.                   │  ← Epilogue, text-secondary
│                                                                  │
│    [  Start Learning  ]    [  Explore Topics  ]                 │  ← CTA buttons
│                                                                  │
│                                                                  │
│                     ↓  scroll                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Details:**
- "Know the" is set in `Fraunces 700` (bold serif), white
- "Machine." is set with a violet-to-sky gradient fill
- "Haunt it." is set in `Fraunces 300 italic` (light weight, italic), ghost-white at 60% opacity
- The line break creates a visual pause — a poetic beat
- The ghost logo sits slightly left of center, rotated ~2 degrees, with a barely-visible glow
- Background has the noise + radial glow texture
- Nav is transparent on load, shifts to surface-blurred after scroll threshold

### Topic Grid Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   KNOWLEDGE DOMAINS              ·  ·    ·                      │
│   ─────────────────────                                          │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │             │  │             │  │             │            │
│  │  🔢 Fndmtls │  │  🖥️ OS      │  │  🌐 Network │            │
│  │             │  │             │  │             │            │
│  │  4 topics   │  │  6 topics   │  │  4 topics   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │             │  │             │  │             │            │
│  │  🧠 AI/ML   │  │  🔐 Security│  │  👾 Hacker  │            │
│  │             │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
│              [  View All 14 Domains  →  ]                       │
└─────────────────────────────────────────────────────────────────┘
```

**Topic Card Details:**
- `120px × 160px` minimum, `200px × 240px` comfortable
- Background: `--surface` with 1px `--border-ghost` border
- Icon: Phosphor icon, `32px`, `--spectral-1` (violet) tint
- Title: `Syne 600`, `1rem`, `--text-primary`
- Count: `Epilogue 400`, `0.8rem`, `--text-tertiary`
- Hover: card lifts to elevation-2, icon gets a very brief shimmer animation
- Cards animate in with staggered fade+slide on scroll enter (30ms between cards)

### "Why Ghost in the Repo?" Section

Full-width, dark text block — almost editorial:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════╗                               │
│  ║                              ║                               │
│  ║  There's a difference        ║                               │
│  ║  between knowing how         ║  ← Fraunces, large, spanning │
│  ║  to use a tool and           ║    3 columns                 │
│  ║  understanding why           ║                               │
│  ║  it works.                   ║                               │
│  ╚══════════════════════════════╝                               │
│                                                    ┌──────────┐ │
│                                                    │ text col │ │
│                                                    │ Epilogue  │ │
│                                                    │ 1.1rem   │ │
│                                                    │          │ │
│                                                    └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

This asymmetric layout — large quote left, explanatory text right — feels like a well-designed editorial spread.

---

## 02. Topics Hub (`/topics`)

### Layout: Left Sidebar + Masonry Grid

```
┌──────┬──────────────────────────────────────────────────────────┐
│ Nav  │                                                           │
├──────┤   TOPICS                                                  │
│      │   ──────────────────────────────────────────             │
│  🔢  │                                                           │
│  Fun │   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│      │   │  short   │  │  short   │  │                      │  │
│  🖥️  │   │  card    │  │  card    │  │  FEATURED TOPIC      │  │
│  OS  │   │          │  │          │  │  (tall card)         │  │
│      │   └──────────┘  └──────────┘  │                      │  │
│  ⌨️  │                                │                      │  │
│  Term│   ┌──────────────────────┐  │                      │  │
│      │   │  wide card           │  │                      │  │
│  🌐  │   │                      │  └──────────────────────┘  │
│  Net │   └──────────────────────┘                             │
│      │                                                           │
│  ⚙️  │   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  Sys │   │          │  │          │  │          │             │
│      │   └──────────┘  └──────────┘  └──────────┘             │
│  🗄️  │                                                           │
│  DB  │                                                           │
│      │                                                           │
│  🌍  │                                                           │
│  Web │                                                           │
│      │                                                           │
│  🔧  │                                                           │
│  Eng │                                                           │
│      │                                                           │
│  ☁️  │                                                           │
│  Cld │                                                           │
│      │                                                           │
│  🔐  │                                                           │
│  Sec │                                                           │
│      │                                                           │
│  🧠  │                                                           │
│  AI  │                                                           │
│      │                                                           │
│  📱  │                                                           │
│  Mob │                                                           │
│      │                                                           │
│  💻  │                                                           │
│  Lang│                                                           │
│      │                                                           │
│  👾  │                                                           │
│  Hack│                                                           │
└──────┴──────────────────────────────────────────────────────────┘
```

**Sidebar details:**
- Width: `220px`, fixed, scrolls with page
- Each topic entry: icon (20px) + label (Syne 500, 0.875rem)
- Active state: left border accent in `--spectral-1`, label turns white, background `--surface`
- Divider between topic groups: 1px `--border-ghost`
- Sidebar itself: `--deep` background, no visible border (bleeds into page bg)

**Topic Cards — three sizes:**
- `sm` — 1 column unit: icon, title, count
- `md` — 2 column units: icon, title, count, 3 preview subtopics
- `lg` — 2 column × 2 row: full description, preview subtopic list, progress indicator

All cards use the same elevation-1 styling on rest, elevation-2 on hover.

---

## 03. Topic Page (e.g., `/operating-systems`)

### Layout: Two Column — Content + TOC

```
┌─────────────────────────────────────────────────────────────────┐
│ [back to topics]                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   🖥️  OPERATING SYSTEMS                  ← category label (Syne, small, spectral-1)
│                                                                  │
│   How Kernels Think                       ← page title (Fraunces, 3rem)
│   ──────────────────────────────                                 │
│   52 topics  ·  4 cheatsheets  ·  2 paths                       │
│                                                                  │
├──────────────────────────────────────┬──────────────────────────┤
│                                      │                          │
│   ▌ OVERVIEW                         │  TABLE OF CONTENTS       │
│                                      │  ─────────────────────   │
│   [rich prose content]               │  › Processes & Threads   │
│   [cheatsheet cards]                 │  › Memory Management     │
│   [code examples]                    │  › File Systems          │
│                                      │  › Scheduling            │
│   ▌ PROCESSES & THREADS              │  › IPC                   │
│                                      │  › Virtualization        │
│   [content...]                       │  › Linux Internals       │
│                                      │                          │
│                                      │  ─────────────────────   │
│                                      │  RELATED TOPICS          │
│                                      │  · Networks              │
│                                      │  · Distributed Systems   │
└──────────────────────────────────────┴──────────────────────────┘
```

**Content column:** `max-width: 720px`, centered with generous padding
**TOC column:** `240px`, sticky at top, `--surface` background, 1px border-left

---

## 04. Cheatsheet Page

Cheatsheets are the core artifact. They need to feel premium — like a beautifully printed reference card.

### Layout: Sectioned Reference Grid

```
┌─────────────────────────────────────────────────────────────────┐
│   ← Back    LINUX TERMINAL CHEATSHEET          [Print]  [Copy]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────────────┐  ┌───────────────────────┐         │
│   │ NAVIGATION            │  │ FILE OPERATIONS        │         │
│   │ ─────────────────     │  │ ─────────────────      │         │
│   │ cd [dir]   Change dir │  │ ls -la    List all     │         │
│   │ pwd        Print cwd  │  │ cp -r     Copy recur.  │         │
│   │ ls         List files │  │ mv        Move/rename  │         │
│   │ tree       Dir tree   │  │ rm -rf    Remove       │         │
│   └───────────────────────┘  └───────────────────────┘         │
│                                                                  │
│   ┌───────────────────────┐  ┌───────────────────────┐         │
│   │ PROCESS MANAGEMENT    │  │ NETWORK                │         │
│   │ ...                   │  │ ...                    │         │
│   └───────────────────────┘  └───────────────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Cheatsheet Card Details:**

```
Section header: Syne 600, 0.75rem, letter-spacing 0.12em, uppercase, --spectral-1
Divider:        1px --border-soft, full width under header

Entry row:
  command:      JetBrains Mono 500, 0.875rem, --spectral-2 (sky blue)
  separator:    1px dotted --border-ghost
  description:  Epilogue 400, 0.875rem, --text-secondary

Row hover:      row background shifts to rgba(125, 211, 252, 0.05)
                command text brightens to --ghost-white

Card:           --surface background
                border: 1px --border-ghost
                border-radius: --radius-lg
                padding: 20px 24px
```

**Print Mode (`[Print]` button):**
Toggling print mode switches the page to a high-contrast white theme optimized for printing, with all UI chrome hidden. The cheatsheet cards render in a clean 2-column grid suitable for A4/Letter paper. A progress bar across the top shows the "print preview."

---

## 05. Knowledge Paths (`/paths`)

### Layout: Interactive Constellation Graph

This is the most visually ambitious page. The learning paths are rendered as a force-directed node graph — a constellation of knowledge.

```
┌─────────────────────────────────────────────────────────────────┐
│   LEARNING PATHS                        [List View] [Graph View] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ·  ·                                                          │
│          ◉ Fundamentals       ·                                  │
│         / \                                                      │
│        /   \            ·                                        │
│       ◉ OS  ◉ Systems     ◉ Networking    ·                     │
│          \  Programming  /                                       │
│           \            /                                         │
│            ◉ Software ◉ Databases           ·                   │
│            Engineering  \                                        │
│           /              ◉ Web Dev  ◉ AI/ML                     │
│          ◉ Cloud &      /                                        │
│         ·  DevOps  ◉ Cybersecurity  ◉ Hacker Mindset           │
│                                                                  │
│   ← drag to explore  ·  scroll to zoom  ·  click to open →     │
└─────────────────────────────────────────────────────────────────┘
```

**Node types:**
- `◎` unstarted — dim circle, dotted border, `--text-tertiary`
- `◉` in progress — solid border, `--spectral-5` (amber) glow
- `●` mastered — filled, `--spectral-3` (emerald) glow, slightly larger
- Selected: pulsing glow ring, hover card appears below node

**Hover card (appears next to selected node):**
```
┌─────────────────────────┐
│  ⚡ ALGORITHMS           │
│  ─────────────────────   │
│  64 topics               │
│  You've mastered 12      │
│                          │
│  [  Open Topic  →  ]     │
└─────────────────────────┘
```

**Edge lines:**
- Solid lines: prerequisite relationship (you should do A before B)
- Dashed lines: related topics (useful context)
- Active path highlighted in violet with subtle glow

---

## 06. Profile & Progress (`/profile`)

### Layout: Stats Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                                                          │  │
│   │   👻 (ghost — spectral density level 3/10)              │  │
│   │   danfisher                                              │  │
│   │   "Intermediate Ghost"                                   │  │
│   │                                                          │  │
│   │   ████████░░░░░░░░░░░░  320 / 800  Spectral Density     │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │  Topics  │  │Cheatsheet│  │  Paths   │  │  Streak  │      │
│   │  12/64   │  │  8/42    │  │  1/12    │  │  7 days  │      │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                  │
│   TOPIC BREAKDOWN                                                │
│   ────────────────────────────────────────────────────────────  │
│   Fundamentals         ████████████░░░░░░  62%                  │
│   Operating Systems    ██████░░░░░░░░░░░░  32%                  │
│   Networking           ███░░░░░░░░░░░░░░░  18%                  │
│   Software Engineering ██░░░░░░░░░░░░░░░░  12%                  │
│   ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Ghost evolution system:**
- Level 1 (0–10%): Ghost is just a wispy outline, 20% opacity
- Level 3 (30–50%): Ghost has defined shape, 60% opacity
- Level 5 (50–70%): Ghost is solid, has faint glow
- Level 7 (70–90%): Ghost has bright violet aura
- Level 10 (100%): Ghost is fully chromatic with all spectral colors, glowing intensely

Each level transition is animated with a dramatic "materialization" effect when the user crosses the threshold.

---

## 07. Codex — Long-form Article (`/codex/[slug]`)

### Layout: Editorial Single Column

For deep-dive articles, the layout is deliberately restrained — pure reading experience.

```
┌─────────────────────────────────────────────────────────────────┐
│   ← Back to Codex                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│              OS  · │  2024  ·  18 min    │                      │  ← metadata
│                    └─────────────────────┘                      │
│                                                                  │
│              How the Linux Kernel                               │
│              Schedules Your Code                                │  ← Fraunces 700
│                                                                  │
│              ─────────────────────────────────────              │
│                                                                  │
│              The scheduler is the most misunderstood            │
│              part of the Linux kernel. Here's how it            │
│              actually works...                                   │  ← Epilogue, 1.125rem
│                                                                  │
│              [content body — max-width 680px, centered]         │
│                                                                  │
│              ┌─────────────────────────────────────┐           │
│              │  // Code block                      │           │
│              │  struct task_struct {                │           │
│              │    ...                               │           │
│              │  }                                   │           │
│              └─────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Typography in the Codex:**
- H1: Fraunces 700, `2.5rem`
- H2: Fraunces 600, `1.75rem` + left border accent in `--spectral-1`
- H3: Syne 600, `1.1rem`, uppercase, letter-spaced
- Body: Epilogue 400, `1.125rem`, `line-height: 1.85`
- Blockquote: left border `4px --spectral-1`, `padding-left: 1.5rem`, italic
- Code block: `--void` background, `Spectral` syntax theme, copyable

**Reading progress:** A thin violet line at the very top of the viewport (1px, fixed) fills left-to-right as the user scrolls. At 100%, it briefly glows and fades.

---

## Responsive Breakpoints

```
xs:  < 480px    — mobile portrait, single column, simplified nav
sm:  480-767px  — mobile landscape, simplified nav
md:  768-1023px — tablet, 2-column grid, collapsible sidebar
lg:  1024-1279px — laptop, full layout, condensed sidebar
xl:  1280-1535px — desktop, full layout, expanded sidebar
2xl: ≥ 1536px   — wide, max-width container centered
```

**Mobile adaptations:**
- Nav collapses to hamburger (bottom drawer on mobile)
- Cheatsheet sections stack single column
- Knowledge graph switches to force-directed list view
- TOC becomes a sticky "jump to section" pill at bottom of screen
- Ghost logo scales down gracefully

---

## Grid System

12-column grid, `24px` gutters, `max-width: 1440px` container.

Common layout configurations:
- `12/12` — full width (hero, cheatsheets)
- `8/12` — main content (codex, topic pages)
- `3/12 + 9/12` — sidebar + content (topic hub)
- `4/12 + 4/12 + 4/12` — three equal cards
- `6/12 + 6/12` — two column splits
