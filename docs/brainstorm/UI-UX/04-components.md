# Ghost in the Repo — Component Library

## Navigation

### Global Navbar

The navbar is the persistent chrome of the site. It must be light, unobtrusive, and powerful.

**Structure:**
```
[ghost logo + wordmark]          [paths] [topics] [codex]          [search] [profile]
```

**States:**
- **Transparent:** On page load for hero pages; background is transparent, text is white
- **Frosted:** After scroll (or on non-hero pages); `background: rgba(8, 12, 21, 0.8)`, `backdrop-filter: blur(24px)`, 1px bottom border `--border-ghost`
- **Transition:** 200ms ease on background/blur property

**Logo block:**
```
👻 ghost in the repo
```
- Ghost SVG: `32px`, animated pulse on hover (scale 1.0 → 1.05 → 1.0, 800ms)
- Wordmark: `Syne 600`, `0.95rem`, `--ghost-white`, letter-spacing: `0.04em`
- On mobile: wordmark hidden, ghost icon only

**Nav links:**
```css
font: Syne 500 / 0.9rem;
color: --text-secondary;
letter-spacing: 0.03em;

/* Hover */
color: --text-primary;
/* Active page */
color: --ghost-white;
position: relative;

/* Active underline */
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--spectral-1);
  border-radius: 1px;
  box-shadow: 0 0 8px var(--glow-violet);
}
```

**Search trigger:**
- Icon button (magnifying glass, Phosphor thin)
- On click: full-width search overlay drops in from top (300ms ease-out)

---

## Search Overlay

Full-screen search that feels like a command palette.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  🔍  Search topics, cheatsheets, guides...              │  │  ← input
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   RECENT                                                         │
│   · Linux File Permissions                                       │
│   · TCP/IP Model                                                 │
│   · Big O Notation                                               │
│                                                                  │
│   SUGGESTIONS                                                    │
│   🖥️  Operating Systems  →  52 topics                           │
│   ⚡  Binary Search       →  Algorithms                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- Backdrop: `rgba(5, 8, 15, 0.92)`, `backdrop-filter: blur(8px)`
- Input: `--surface-raised`, `1.25rem`, `Epilogue 400`, violet focus ring
- Results animate in with 20ms stagger
- Keyboard: ↑↓ to navigate, Enter to open, Escape to close
- Shows topic icon, title, category path

---

## Topic Cards

### Small Card (grid default)

```
┌──────────────────────────┐
│                          │
│  [icon: 32px, spectral]  │
│                          │
│  Operating Systems       │  ← Syne 600, 1rem
│  52 topics               │  ← Epilogue 400, 0.8rem, tertiary
│                          │
└──────────────────────────┘
```
Size: `180px × 200px`
Background: `--surface` → `--surface-raised` on hover

### Medium Card

```
┌──────────────────────────────────────┐
│  [icon: 40px]   Operating Systems    │
│                 52 topics · 4 sheets │
├──────────────────────────────────────┤
│  · Processes & Threads               │
│  · Memory Management                 │
│  · File Systems                      │
│  + 49 more...                        │
└──────────────────────────────────────┘
```

### Large / Featured Card

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   [icon: 48px, full violet glow]                     │
│                                                      │
│   Operating Systems                                  │  ← Fraunces 600, 1.75rem
│                                                      │
│   How kernels manage processes, memory, and          │
│   filesystems. The foundation of everything.         │  ← Epilogue 400, 0.95rem
│                                                      │
│   Progress: ████████░░░░░░░░  52%                    │  ← if logged in
│                                                      │
│   [  Open Topic  →  ]                                │
└──────────────────────────────────────────────────────┘
```

---

## Cheatsheet Entries

The atomic unit of a cheatsheet — one command or concept:

```
┌──────────────────────────────────────────────────────────────────┐
│  ls -la                    List all files with details           │
│  ─────────────────────────────────────────────────────────────── │
│  find . -name "*.py"       Find Python files recursively         │
│  ─────────────────────────────────────────────────────────────── │
│  grep -r "pattern" dir/    Recursive grep with color             │
└──────────────────────────────────────────────────────────────────┘
```

**Entry structure (CSS Grid):**
```css
.cheatsheet-entry {
  display: grid;
  grid-template-columns: minmax(140px, 200px) 1fr;
  gap: 0 24px;
  padding: 9px 12px;
  border-radius: 4px;
  transition: background 150ms ease;
}

.cheatsheet-entry:hover {
  background: rgba(125, 211, 252, 0.05);
}

.entry-command {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--spectral-2);
  font-weight: 500;
}

.entry-description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

**Cheatsheet Section Card:**
```css
.cheatsheet-section {
  background: var(--surface);
  border: 1px solid var(--border-ghost);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.cheatsheet-section:hover {
  border-color: var(--border-subtle);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.section-header {
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--spectral-1);
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-ghost);
}
```

---

## Buttons

### Primary (CTA)

```css
.btn-primary {
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-inverse);
  background: var(--spectral-1);
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  /* shimmer sweep on hover */
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  transition: transform 500ms ease;
}

.btn-primary:hover::after {
  transform: translateX(100%);
}

.btn-primary:hover {
  box-shadow:
    0 0 0 1px rgba(167, 139, 250, 0.5),
    0 4px 20px var(--glow-violet);
  transform: translateY(-1px);
}
```

### Secondary (Ghost Button)

```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-medium);
  color: var(--text-primary);
  /* same sizing as primary */
  transition: all 200ms ease;
}

.btn-secondary:hover {
  border-color: var(--spectral-1);
  color: var(--ghost-white);
  background: rgba(167, 139, 250, 0.08);
}
```

### Icon Button

```css
.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-tertiary);
  display: grid;
  place-items: center;
  transition: all 150ms ease;
}

.btn-icon:hover {
  background: var(--surface);
  border-color: var(--border-subtle);
  color: var(--text-primary);
}
```

---

## Code Blocks

```
┌───────────────────────────────────────────────────────────────┐
│ bash                                              [copy] [wrap]│  ← header bar
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   #!/bin/bash                                                 │
│   ps aux | grep nginx | awk '{print $2}' | xargs kill        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

```css
.code-block {
  background: #0A0E18;
  border: 1px solid var(--border-ghost);
  border-radius: var(--radius-lg);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.7;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-ghost);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  letter-spacing: 0.05em;
}

.code-body {
  padding: 20px 24px;
  overflow-x: auto;
  tab-size: 2;
}
```

---

## Progress Indicators

### Topic Progress Bar

```css
.progress-bar {
  height: 4px;
  background: var(--surface-raised);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--spectral-1),   /* violet at left */
    var(--spectral-2)    /* sky at right */
  );
  border-radius: 2px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Shimmer animation on the fill */
.progress-fill::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -2px;
  bottom: -2px;
  width: 4px;
  background: var(--spectral-2);
  border-radius: 2px;
  filter: blur(2px);
  box-shadow: 0 0 6px var(--glow-sky);
}
```

### Spectral Density Meter (Profile)

A large, circular arc meter for the overall mastery level.

- SVG circle with stroke-dasharray animation
- Arc sweeps from bottom-left, clockwise, to bottom-right
- Color transitions: `--spectral-5` (amber) at 0–40%, `--spectral-2` (sky) at 40–70%, `--spectral-3` (emerald) at 70–90%, full spectral rainbow at 100%
- Center: ghost icon + level number
- Outer ring: ghostly particles orbit the circle slowly

---

## Tags & Badges

### Topic Tag
```css
.tag {
  font-family: var(--font-ui);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: rgba(167, 139, 250, 0.12);
  color: var(--spectral-1);
  border: 1px solid rgba(167, 139, 250, 0.2);
}
```

### Difficulty Badges
```
[  BEGINNER  ]   → spectral-3 (emerald) tint
[  INTERMEDIATE  ]   → spectral-5 (amber) tint
[  ADVANCED  ]   → spectral-1 (violet) tint
[  ARCANE  ]     → spectral-4 (pink) tint — the hardest stuff
```

"Arcane" is a nod to the ghost theme — reserved for content like distributed consensus, CPU microarchitecture, compiler internals.

---

## Callout Blocks (Codex)

Four variants for inline callouts in long-form content:

```
╔══════════════════════════════════════════════════════════════╗
║  💡 KEY INSIGHT                                               ║  ← Syne, small caps, spectral-2
║  ─────────────────────────────────────────────────────────── ║
║  The CFS scheduler doesn't just pick the process with the    ║
║  least CPU time — it picks based on virtual runtime...       ║  ← Epilogue body
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  ⚠️  GOTCHA                                                   ║  ← amber tint
║  ─────────────────────────────────────────────────────────── ║
║  fork() copies the parent's memory using copy-on-write.      ║
║  It doesn't actually allocate new pages immediately.         ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  🔗 MENTAL MODEL                                              ║  ← violet tint
║  ─────────────────────────────────────────────────────────── ║
║  Think of the scheduler as a time-sharing bank account...    ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  🔐 DEEP DIVE                                                 ║  ← pink tint, advanced content
║  ─────────────────────────────────────────────────────────── ║
║  If you want to go further: read lkml.org, specifically...   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Ghost Logo Component

The ghost is the heart of the visual identity.

### SVG Structure
```svg
<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
  <!-- Ghost body: single continuous path -->
  <!-- Top: semicircle -->
  <!-- Sides: vertical -->
  <!-- Bottom: wavy edge (3 scallops) -->
  <!-- Eyes: two small filled circles with subtle glow -->

  <defs>
    <linearGradient id="ghost-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F0F4FF" />
      <stop offset="100%" stop-color="#C4BCFF" />
    </linearGradient>
    <filter id="ghost-glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <path
    d="M24 4C14.059 4 6 12.059 6 22V44L10 40L14 44L18 40L22 44L26 40L30 44L34 40L38 44L42 40V22C42 12.059 33.941 4 24 4Z"
    fill="url(#ghost-gradient)"
    filter="url(#ghost-glow)"
    opacity="0.95"
  />

  <!-- Eyes -->
  <circle cx="18" cy="22" r="3" fill="#080C15" />
  <circle cx="30" cy="22" r="3" fill="#080C15" />

  <!-- Eye shine -->
  <circle cx="19.5" cy="20.5" r="1" fill="white" opacity="0.6" />
  <circle cx="31.5" cy="20.5" r="1" fill="white" opacity="0.6" />
</svg>
```

### Animation States
```css
/* Idle: subtle floating */
.ghost-logo {
  animation: ghost-float 4s ease-in-out infinite;
}
@keyframes ghost-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}

/* Hover: glow intensifies, slight scale */
.ghost-logo:hover {
  filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.6))
          drop-shadow(0 0 24px rgba(167, 139, 250, 0.3));
  transform: scale(1.08) translateY(-4px);
  transition: all 300ms ease;
}

/* Active/click: quick squeeze */
.ghost-logo:active {
  transform: scale(0.95);
  transition: transform 100ms ease;
}
```

---

## Empty States

When a user has no progress yet, topic pages show a welcoming empty state:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              👻  (ghost, wispy, animated)                │
│                                                          │
│           You haven't started this topic yet.            │  ← Epilogue 400
│                                                          │
│           [  Start Learning  →  ]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The ghost in the empty state is at its "wispy" level — 30% opacity, just an outline. It's a gentle nudge: *you could make this ghost solid.*

---

## Tooltip

```css
.tooltip {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-primary);
  background: var(--surface-float);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  pointer-events: none;
  /* animate in */
  animation: tooltip-in 150ms ease forwards;
}

@keyframes tooltip-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
