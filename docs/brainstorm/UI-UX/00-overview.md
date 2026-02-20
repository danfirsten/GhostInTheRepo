# Ghost in the Repo — UI/UX Design Overview

> The complete reference for software engineers who want to understand everything, deeply.

---

## Quick Reference

| File | Contents |
|---|---|
| `01-vision-and-concept.md` | Brand identity, emotional arc, site architecture, the Ghost metaphor |
| `02-design-system.md` | Colors, typography (Fraunces + Syne + Epilogue + JetBrains Mono), spacing, elevation, syntax theme |
| `03-page-layouts.md` | Landing, Topics Hub, Topic Page, Cheatsheet, Knowledge Graph, Profile, Codex |
| `04-components.md` | Navbar, search, cards, buttons, code blocks, progress bars, tags, ghost SVG |
| `05-motion-and-interactions.md` | Easing curves, page load sequence, scroll reveals, ambient animations, milestone moment |

---

## The Concept in One Sentence

A dark-academia editorial platform where every design decision makes you feel like you're being initiated into something powerful and secret — the ghost is you, and the deeper you go, the more solid it becomes.

---

## Key Design Decisions (TL;DR)

**Palette:** Deep blue-black void (`#080C15`) + spectral accents: violet (`#A78BFA`), sky (`#7DD3FC`), emerald (`#34D399`), pink (`#F472B6`), amber (`#FB923C`).

**Fonts:**
- `Fraunces` — dramatic editorial serif for all display / hero text
- `Syne` — geometric, irregular sans for navigation and UI labels
- `Epilogue` — clean, readable sans for body prose
- `JetBrains Mono` — all code

**Motion:** Slow, ethereal drift-in animations. One orchestrated page load sequence. Rare but spectacular milestone animations. Nothing bouncy, nothing gratuitous.

**Ghost:** An SVG ghost mascot that evolves with the user's progress — wispy at level 1, solid and glowing at level 10. The ghost floats, blinks, and particles orbit it.

**Cheatsheets:** Two-column reference grids with a custom `Spectral` syntax theme — feel like premium printed reference cards, not bullet-point dumps.

**Knowledge Graph:** `/paths` page renders learning paths as an interactive constellation (force-directed graph) — mastered nodes glow, locked ones are wisps.

---

## Tone

```
Not:  Hacker / terminal green / matrix
Not:  Purple gradients on white (generic AI aesthetic)
Not:  Bootcamp / beginner tutorial vibes
Not:  Heavy / cluttered / dashboard chaos

Yes:  Dark academia meets modern SaaS
Yes:  Premium, editorial, focused
Yes:  Spectral, layered, translucent
Yes:  Confident — like you already know this stuff
Yes:  The kind of site you'd screenshot and share
```

---

## Tech Stack Recommendations

| Layer | Recommendation | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Static generation for cheatsheets, easy routing, great font support |
| Styling | CSS Modules + CSS Variables | Design system tokens, no runtime overhead |
| Animations | CSS-first + Framer Motion for complex | CSS handles most; Framer for knowledge graph |
| Icons | Phosphor Icons | Clean thin-weight icons across all topics |
| Code highlighting | Shiki | Best syntax highlighting, supports custom themes |
| Knowledge Graph | D3.js force simulation | The right tool for the constellation view |
| Fonts | Google Fonts (self-hosted) | Self-host for performance |
| Search | Fuse.js (client-side) | Fast fuzzy search, no backend needed for v1 |

---

## Content Topics (All 14 Domains)

```
1.  Fundamentals               — data structures, algorithms, computer architecture, discrete math, compilers
2.  Operating Systems          — OS concepts, Linux, processes, memory, file systems, concurrency
3.  Terminal, Vim & Tools      — bash, vim, git, tmux, shell scripting, build systems
4.  Networking                 — TCP/IP, DNS, TLS, HTTP, protocols, network programming
5.  Systems Programming        — C/C++, Rust, low-level systems design
6.  Databases                  — SQL, NoSQL, database internals
7.  Web Development            — frontend, backend, APIs, web performance
8.  Software Engineering       — design patterns, clean code, testing, system design, distributed systems
9.  Cloud & DevOps             — cloud platforms, Docker, Kubernetes, CI/CD, IaC, observability
10. Cybersecurity              — security fundamentals, offensive security, cryptography, web security
11. AI, ML & Data              — machine learning, deep learning, NLP/LLMs, AI engineering, data engineering
12. Mobile & App Dev           — iOS, Android, cross-platform, desktop
13. Programming Languages      — Python, JavaScript/TypeScript, Go, language theory
14. The Hacker Mindset         — CTF, ethical hacking, reverse engineering, engineering mindset
```

Each domain has: cheatsheets, a codex section, and fits into multiple learning paths.
