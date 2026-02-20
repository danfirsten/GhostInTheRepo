# Ghost in the Repo — Motion & Interactions

## Motion Philosophy

Motion in Ghost in the Repo should feel like *something materializing* — not bouncing, not sliding mechanically, but drifting into existence the way a ghost would. The guiding principle:

> **Things don't move. Things arrive.**

Animation is used sparingly but with high impact. Every animated element should earn its motion. The goal is to reinforce the feeling of power and depth — not to dazzle for its own sake.

---

## Easing Curves

```css
:root {
  /* Standard: default transitions */
  --ease-standard:  cubic-bezier(0.4, 0.0, 0.2, 1);

  /* Enter: elements coming in */
  --ease-enter:     cubic-bezier(0.0, 0.0, 0.2, 1);

  /* Exit: elements leaving */
  --ease-exit:      cubic-bezier(0.4, 0.0, 1.0, 1);

  /* Bounce: for playful elements (ghost logo only) */
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Ghost drift: slow, ethereal */
  --ease-drift:     cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

---

## Timing Reference

```
Instant:     0ms       — tooltip trigger
Snap:        80–120ms  — button states, toggle switches
Quick:       150–200ms — hover effects, icon transitions
Standard:    200–300ms — card elevations, nav background
Deliberate:  300–500ms — page section reveals, modals entering
Cinematic:   600–1200ms — hero animations, progress bar fills
Eternal:     2000ms+   — ambient effects (floating, pulsing)
```

---

## Page Load Sequence (Hero)

The landing page has one carefully orchestrated entrance animation. Nothing moves randomly — it's a single narrative sequence.

```
Timeline from page load (0ms):
───────────────────────────────────────────────────────────
0ms       Background texture fades in (opacity 0→1, 400ms)
           ease: --ease-enter

100ms     Ghost logo materializes:
           · Scale: 0.85 → 1.0 (400ms, --ease-spring)
           · Opacity: 0 → 1 (300ms, --ease-enter)
           · Filter: blur(8px) → blur(0) (400ms)

300ms     Hero headline line 1 enters:
           · translateY: 20px → 0 (500ms, --ease-enter)
           · opacity: 0 → 1 (500ms)

450ms     Hero headline line 2 enters:
           (same as above, 150ms after line 1)

600ms     Subheading fades in:
           · opacity: 0 → 1 (400ms, ease)

750ms     CTA buttons slide up:
           · translateY: 16px → 0 (400ms, --ease-spring)
           · opacity: 0 → 1 (300ms)
           · Stagger: 80ms between buttons

900ms     Particle field activates:
           · Particles fade in over 600ms
           · Each particle has randomized delay (0–800ms)

1200ms    Nav links fade in:
           · Stagger 50ms per link
           · opacity: 0 → 1 (250ms each)
```

This entire sequence takes about 1.5 seconds and feels like the page is *waking up*.

---

## Scroll-Triggered Animations

All scroll animations use `IntersectionObserver` with a 0.15 threshold. Elements animate once (no re-trigger on scroll up).

### Default Reveal (most content)
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 500ms var(--ease-enter),
    transform 500ms var(--ease-enter);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Card Grid Stagger
When a grid of cards enters the viewport, they stagger with 40ms between each:
```css
.card-grid .card:nth-child(1) { transition-delay: 0ms; }
.card-grid .card:nth-child(2) { transition-delay: 40ms; }
.card-grid .card:nth-child(3) { transition-delay: 80ms; }
/* ... and so on */
```

Maximum stagger: 400ms (10th+ cards animate simultaneously after that)

### Section Header Reveal
Section headers get a slightly different treatment — the label slides in from the left, then the title fades up:
```css
/* Label: slides from left */
.section-label {
  transform: translateX(-16px);
  opacity: 0;
  transition: all 400ms var(--ease-enter);
}

/* Title: fades up 100ms after label */
.section-title {
  transform: translateY(16px);
  opacity: 0;
  transition: all 500ms var(--ease-enter) 100ms;
}
```

---

## Ambient Animations

These run continuously and establish the "alive" feeling of the platform. All are very subtle.

### Ghost Float (Sidebar & Logo)
```css
@keyframes ghost-float {
  0%   { transform: translateY(0px) rotate(0deg); }
  33%  { transform: translateY(-8px) rotate(0.5deg); }
  66%  { transform: translateY(-4px) rotate(-0.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.ghost-ambient {
  animation: ghost-float 5s var(--ease-drift) infinite;
}
```

### Ghost Eyes Blink
The ghost's eyes periodically blink — a very human touch.
```css
@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.1); }
}

.ghost-eye {
  transform-origin: center;
  animation: blink 6s ease infinite;
}
.ghost-eye:last-child {
  animation-delay: 0.12s; /* eyes don't blink perfectly in sync */
}
```

### Particle Field
The hero background particle system:
```css
@keyframes particle-drift {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10%  { opacity: var(--particle-opacity); }
  90%  { opacity: var(--particle-opacity); }
  100% { transform: translateY(-200px) translateX(var(--drift-x)) scale(0.5); opacity: 0; }
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: white;
  animation: particle-drift var(--duration) var(--ease-drift) infinite;
  animation-delay: var(--delay);
}
```

Each particle is generated with randomized `--size` (1–3px), `--duration` (15–35s), `--delay` (0–20s), `--drift-x` (-40px to +40px), `--particle-opacity` (0.03–0.10).

### Progress Shimmer
For in-progress elements (loading, processing), a shimmer sweeps across:
```css
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surface-raised) 40%,
    var(--surface-float) 50%,
    var(--surface-raised) 60%,
    var(--surface) 100%
  );
  background-size: 200% auto;
  animation: shimmer 1.5s linear infinite;
}
```

---

## Hover Interactions

### Topic Card
1. **0ms:** card background transitions to `--surface-raised` (200ms)
2. **0ms:** box-shadow deepens (200ms)
3. **0ms:** icon begins brief shimmer rotation (360deg, 400ms, ease, once)
4. **0ms:** topic title color shifts from `--text-primary` to `--ghost-white` (200ms)
5. **100ms:** bottom-right arrow icon appears (fade in 150ms)

### Nav Link
1. Color: `--text-secondary` → `--text-primary` (150ms)
2. If active: underline glows (100ms)

### Ghost Logo (Navbar)
1. Scale: 1.0 → 1.06 (200ms, --ease-spring)
2. Drop shadow intensifies to violet glow (200ms)
3. Floating amplitude increases briefly

### Knowledge Graph Node
1. Pulse ring appears: SVG circle expands outward and fades (800ms loop)
2. Node scale: 1.0 → 1.15 (200ms, --ease-spring)
3. Hover card fades in at cursor-adjacent position (150ms)
4. Connected edges highlight with flowing dot animation

---

## Page Transitions (Next.js App Router)

Transitions between routes should feel like moving through space, not clicking through pages.

### Enter: New page materializes
```css
.page-enter {
  animation: page-in 350ms var(--ease-enter) forwards;
}

@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

### Exit: Old page dissolves
```css
.page-exit {
  animation: page-out 200ms var(--ease-exit) forwards;
}

@keyframes page-exit {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
```

The stagger between exit (200ms) and enter (350ms) creates a clean 50ms gap between pages.

---

## The Mastery Milestone Animation

When a user completes a topic or reaches a new "Spectral Density" level, a special full-screen moment plays:

### Sequence (1.2 seconds total):
```
0ms      Screen: subtle vignette darkens from edges (400ms)

100ms    Ghost logo (large, centered): materializes with particle burst
          · Scale: 0 → 1.0 (600ms, --ease-spring)
          · 40 particles explode outward (randomized angles, spectral colors)
          · Ghost opacity: 0 → 1 (300ms)

200ms    Level text fades in below ghost:
          · "SPECTRAL DENSITY LEVEL 4"
          · Fraunces 700, 1.5rem, ghost-white
          · opacity: 0 → 1 (300ms, delay 200ms)

400ms    Ghost glow intensifies to full rainbow spectrum (400ms)

600ms    New title text fades in:
          · "NETWORK PHANTOM"  (or whatever the new title is)
          · Syne 500, small caps, spectral-1

900ms    Particle burst fades out (300ms)

1000ms   "CONTINUE" button appears with gentle bounce

1200ms   User dismisses → vignette fades, ghost logo returns to sidebar
```

This is *earned* spectacle. It happens rarely — only at major milestones. The user feels like they just powered up.

---

## Micro-interactions

### Copy Button (Code Blocks)
```
Click → Icon: copy → check (150ms icon swap)
      → Background: brief flash to rgba(52, 211, 153, 0.12) (emerald)
      → After 2s: icon reverts to copy
```

### Cheatsheet Entry Hover
```
Hover → Row background tints sky-blue (150ms)
      → Command text brightens to ghost-white (150ms)
```

### Search Input Focus
```
Focus → Border: --border-subtle → 1px --spectral-1 (150ms)
      → Box shadow: 0 0 0 3px var(--glow-violet) appears (200ms)
      → Placeholder text fades slightly (100ms)
```

### Tag Hover
```
Hover → Background opacity: 0.12 → 0.20 (150ms)
      → Border opacity increases (150ms)
      → Slight translateY(-1px) (150ms)
```

### Progress Bar Fill (on mount)
```
Mount → Width animates from 0 to actual% (700ms, ease-out)
      → The glow tip at the right end pulses once when settled
```

---

## Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Kill ambient animations */
  .ghost-ambient,
  .particle,
  .progress-fill::after {
    animation: none;
  }

  /* Snap instead of transition */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep meaningful state changes but instant */
  .reveal { opacity: 1; transform: none; }
}
```

---

## Performance Budget

| Category | Budget |
|---|---|
| Total animation overhead | < 2ms per frame |
| Number of concurrent animations | < 20 |
| Particle count | 30–50 (requestAnimationFrame pool) |
| Transition count on hover | Max 3 properties |
| CSS-only animations | Prefer always |
| JS-driven animations | Only for knowledge graph, milestone, particles |

All animations target 60fps on mid-range hardware. GPU compositing is used for all transforms and opacity animations (no layout-triggering properties animated).

---

## Sound Design (Optional / Future)

Not launched initially, but designed for as a future enhancement:

- **Page load:** 100ms, very quiet — a low resonant hum, like a computer booting
- **Topic complete:** A soft, rising 3-note chime (the "level up" for zen)
- **Milestone:** The Ghost milestone sequence has an optional ambient swell
- **Search keystroke:** Optional very quiet, short tap sound

All sounds OFF by default. User opt-in in settings.
