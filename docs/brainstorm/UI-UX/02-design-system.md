# Ghost in the Repo — Design System

## The Visual Language

Every decision — from font weight to border radius to shadow spread — serves the same north star: **make the user feel like a powerful, focused intellect moving through a beautiful system.**

---

## Color System

### The Palette Philosophy

Built around the concept of **spectral depth**: a void beneath, with layers of light floating above it. Color communicates meaning, not decoration. The dark void is the base. Each surface layer adds a subtle lift. Accent colors are used sparingly — when they appear, they *matter*.

### Base Scale (CSS Variables)

```css
:root {
  /* The Void — backgrounds */
  --void:          #05080F;   /* deepest background, true dark */
  --abyss:         #080C15;   /* page background */
  --deep:          #0C1120;   /* section backgrounds */
  --surface:       #111827;   /* card surfaces */
  --surface-raised: #171F30;  /* elevated cards, modals */
  --surface-float:  #1D2640;  /* topmost floating elements */

  /* Borders & Dividers */
  --border-ghost:  rgba(255, 255, 255, 0.06);  /* barely-there dividers */
  --border-subtle: rgba(255, 255, 255, 0.10);
  --border-soft:   rgba(255, 255, 255, 0.16);
  --border-medium: rgba(255, 255, 255, 0.24);

  /* Text */
  --text-primary:  #E8EDF7;   /* near-white with cool blue shift */
  --text-secondary: #9AA3B5;  /* muted, secondary information */
  --text-tertiary:  #5A6478;  /* placeholders, timestamps */
  --text-inverse:   #080C15;  /* text on light surfaces */

  /* Ghost Spectral — accent palette */
  --spectral-1:    #A78BFA;   /* violet — primary accent */
  --spectral-2:    #7DD3FC;   /* sky — links, info */
  --spectral-3:    #34D399;   /* emerald — success, mastered */
  --spectral-4:    #F472B6;   /* pink — highlights, warnings */
  --spectral-5:    #FB923C;   /* amber — in-progress, medium */

  /* Glow versions (for box-shadow effects) */
  --glow-violet:   rgba(167, 139, 250, 0.20);
  --glow-sky:      rgba(125, 211, 252, 0.20);
  --glow-emerald:  rgba(52, 211, 153, 0.20);

  /* The Ghost White — special use only */
  --ghost-white:   #F0F4FF;   /* pure spectral white, hero text */
}
```

### Color Usage Rules

| Context | Variable |
|---|---|
| Page background | `--abyss` |
| Section bg | `--deep` |
| Default card | `--surface` |
| Hovered/active card | `--surface-raised` |
| Modal / dropdown | `--surface-float` |
| Primary action | `--spectral-1` (violet) |
| Links | `--spectral-2` (sky) |
| Mastered/complete | `--spectral-3` (emerald) |
| Hero display text | `--ghost-white` |
| Body text | `--text-primary` |
| Captions/meta | `--text-secondary` |

### The Glow Principle

Glows should feel *earned*, not decorative. Apply glow only to:
1. The logo on hover
2. Active nav items
3. CTA buttons on hover
4. Progress indicators at 100%
5. Mastered topic badges

Never apply glow to body text or decorative elements.

---

## Typography

### The Stack

Three typefaces, each with a clear job:

```css
/* Display — for hero text, section titles, the big moments */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');
--font-display: 'Fraunces', Georgia, serif;

/* Interface — for navigation, labels, UI chrome */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap');
--font-ui: 'Syne', system-ui, sans-serif;

/* Body — for prose, explanations, cheatsheet content */
@import url('https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap');
--font-body: 'Epilogue', system-ui, sans-serif;

/* Code — for all monospaced content */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Why these fonts?**

- **Fraunces** — A variable serif with optical size variation. At large sizes it has drama and personality; at small sizes it becomes elegant and readable. The "soft" axis makes it feel warm, not cold. Perfect for a platform that's serious without being clinical.
- **Syne** — Geometric but with irregular proportions that feel almost handmade. Used for navigation, badges, tags — it gives the interface a distinct "studio" feel, like something designed by a thoughtful human, not auto-generated.
- **Epilogue** — Modern, slightly geometric sans with excellent readability at small sizes and surprising character at large. Better than the usual suspects (Inter, DM Sans) while just as functional.
- **JetBrains Mono** — The unambiguous best monospace for code. Excellent ligatures, great weight range, feels at home in a serious dev platform.

### Type Scale

```css
:root {
  /* Display sizes — Fraunces */
  --text-display-2xl: clamp(4rem, 8vw, 7rem);     /* Hero headline */
  --text-display-xl:  clamp(2.5rem, 5vw, 4.5rem); /* Section hero */
  --text-display-lg:  clamp(2rem, 3.5vw, 3rem);   /* Page title */
  --text-display-md:  clamp(1.5rem, 2.5vw, 2rem); /* Card title */

  /* UI sizes — Syne */
  --text-ui-xl:   1.25rem;  /* Nav primary */
  --text-ui-lg:   1.125rem; /* Subnav */
  --text-ui-md:   1rem;     /* Labels */
  --text-ui-sm:   0.875rem; /* Tags, badges */
  --text-ui-xs:   0.75rem;  /* Meta, timestamps */

  /* Body sizes — Epilogue */
  --text-body-xl:  1.25rem;  /* Lead paragraphs */
  --text-body-lg:  1.125rem; /* Comfortable reading */
  --text-body-md:  1rem;     /* Default body */
  --text-body-sm:  0.875rem; /* Captions */

  /* Mono sizes — JetBrains Mono */
  --text-mono-lg:  1rem;
  --text-mono-md:  0.875rem;
  --text-mono-sm:  0.75rem;
}
```

### Type Pairing Examples

**Hero Section:**
```
Fraunces 700  /  7rem  /  --ghost-white
"Know the machine."

Epilogue 400  /  1.25rem  /  --text-secondary
"The complete reference for software engineers who want to
understand everything, deeply."
```

**Section Header:**
```
Syne 500  /  0.75rem  /  --spectral-1  /  letter-spacing: 0.15em  /  uppercase
"OPERATING SYSTEMS"

Fraunces 600  /  2.5rem  /  --text-primary
"How Kernels Think"
```

**Body Prose:**
```
Epilogue 400  /  1.125rem  /  --text-primary  /  line-height: 1.8
```

**Code Inline:**
```
JetBrains Mono 400  /  0.9em  /  --spectral-2
/  background: rgba(125, 211, 252, 0.08)  /  border-radius: 3px
```

---

## Spacing System

```css
:root {
  --space-1:  0.25rem;   /* 4px  — tight gap */
  --space-2:  0.5rem;    /* 8px  — icon padding */
  --space-3:  0.75rem;   /* 12px — compact */
  --space-4:  1rem;      /* 16px — base unit */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px — card padding */
  --space-8:  2rem;      /* 32px — section spacing */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px — major sections */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px — hero padding */
  --space-32: 8rem;      /* 128px — hero breathing room */
}
```

---

## Elevation & Depth System

Ghost in the Repo uses light as a metaphor for elevation. Higher = more light = more present.

```css
/* Level 0: Submerged (backgrounds) */
.elevation-0 {
  background: var(--abyss);
}

/* Level 1: Resting (default cards) */
.elevation-1 {
  background: var(--surface);
  border: 1px solid var(--border-ghost);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* Level 2: Raised (hovered cards, active items) */
.elevation-2 {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 1px 0 var(--border-soft) inset;
}

/* Level 3: Floating (dropdowns, tooltips) */
.elevation-3 {
  background: var(--surface-float);
  border: 1px solid var(--border-soft);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 1px 0 var(--border-medium) inset;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Ghost Glow — applied to featured/active elements */
.glow-violet {
  box-shadow:
    0 0 0 1px var(--spectral-1),
    0 0 24px var(--glow-violet),
    0 0 48px rgba(167, 139, 250, 0.08);
}
```

---

## Border Radius

```css
:root {
  --radius-sm:   4px;   /* tags, code blocks */
  --radius-md:   8px;   /* buttons, inputs */
  --radius-lg:   12px;  /* cards */
  --radius-xl:   16px;  /* panels */
  --radius-2xl:  24px;  /* modals */
  --radius-full: 9999px; /* pills, avatars */
}
```

---

## Iconography

**Icon library:** Phosphor Icons (thin/light weight)

Why Phosphor:
- Exceptionally clean at small sizes
- The "thin" weight matches the ethereal aesthetic
- Consistent grid across all icons
- Large library covering all CS topic icons needed

Key icons mapped to topics:
```
operating-systems    →  ph-cpu
distributed-systems  →  ph-graph
networks             →  ph-network
algorithms           →  ph-tree-structure
data-structures      →  ph-stack
systems-design       →  ph-blueprint
databases            →  ph-database
containerization     →  ph-package
web-development      →  ph-globe
mobile               →  ph-device-mobile
ai-ml                →  ph-brain
security             →  ph-shield-check
terminal             →  ph-terminal-window
compilers            →  ph-code-block
architecture         →  ph-circuit-board
math-for-cs          →  ph-sigma
```

---

## The Ghost Particle System

A subtle ambient effect used in the hero and certain section transitions. Behavior:

- 30–60 tiny white particles (2–4px circles) drift upward slowly
- Opacity: 0.03 to 0.12, varying
- Speed: 10–30s per cycle, randomized
- On cursor proximity (within 80px): particles drift slightly toward cursor
- On hover over ghost logo: burst of particles outward

This is implemented in CSS + lightweight vanilla JS (no canvas dependency in static pages). React variant uses a custom hook.

---

## Background Texture

The background is not flat black. It uses a layered approach:

```css
body {
  background-color: var(--abyss);
  background-image:
    /* Noise grain for depth — very subtle */
    url("data:image/svg+xml,..."),
    /* Radial gradient — faint blue-purple glow at top center */
    radial-gradient(
      ellipse 80% 50% at 50% -10%,
      rgba(139, 92, 246, 0.08) 0%,
      transparent 60%
    ),
    /* Radial gradient — deep blue warmth at bottom */
    radial-gradient(
      ellipse 60% 40% at 50% 110%,
      rgba(59, 130, 246, 0.05) 0%,
      transparent 60%
    );
}
```

The result: a background that feels atmospheric and dimensional, not just dark.

---

## Syntax Highlighting Theme

Custom theme called **"Spectral"** — built for Ghost in the Repo.

```
Background:  #0A0E18
Gutter:      #1A2033
Selection:   rgba(167, 139, 250, 0.15)

Keywords:    #A78BFA  (violet — spectral-1)
Strings:     #34D399  (emerald — spectral-3)
Numbers:     #7DD3FC  (sky — spectral-2)
Functions:   #F0F4FF  (ghost-white)
Classes:     #F472B6  (pink — spectral-4)
Comments:    #4A5568  (muted)
Variables:   #9AA3B5  (text-secondary)
Operators:   #7DD3FC  (sky)
Punctuation: #5A6478  (text-tertiary)
```
