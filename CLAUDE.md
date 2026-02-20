# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ghost in the Repo is a fully static, read-only reference platform for software engineers. No database, no auth, no progress tracking — deploys anywhere as pure static files.

**Stack:** Next.js 16 (App Router), TypeScript, CSS Modules + CSS Custom Properties, Shiki (custom "Spectral" syntax theme), Phosphor Icons, Fuse.js (client-side search), D3.js (knowledge graph), Framer Motion (graph + page transitions only).

## Key Architecture Decisions

- **No backend.** Zero serverless functions. `next build` must produce fully static output.
- **No database or auth.** No user accounts, no progress tracking, no localStorage for user state (search history is the sole localStorage use).
- **CSS-first animations.** Use CSS keyframes and transitions for everything except the D3.js knowledge graph and page transitions (Framer Motion).
- **Self-hosted fonts via `next/font/google`.** Fraunces (display), Syne (UI), Epilogue (body), JetBrains Mono (code).
- **Content sourced from `docs/research/`** — 14 domains of markdown files parsed at build time with `gray-matter`.

## Documentation (Read Before Building)

All design and architecture specs live in `docs/`:

- `docs/implementation_plan.md` — **The build plan.** 11 phases, dependency map, every file/component specified. This is the source of truth for what to build and in what order.
- `docs/brainstorm/UI-UX/00-overview.md` — Quick reference: fonts, palette, tech stack, all 14 domains.
- `docs/brainstorm/UI-UX/01-vision-and-concept.md` — Brand identity, site architecture, ghost metaphor.
- `docs/brainstorm/UI-UX/02-design-system.md` — All CSS custom properties (colors, spacing, typography, elevation), Spectral syntax theme token colors, Phosphor icon mapping.
- `docs/brainstorm/UI-UX/03-page-layouts.md` — ASCII wireframes for every page: landing, topics hub, topic page, cheatsheet, knowledge graph, codex.
- `docs/brainstorm/UI-UX/04-components.md` — Component specs with CSS: navbar, search overlay, cards, buttons, code blocks, ghost SVG, callouts.
- `docs/brainstorm/UI-UX/05-motion-and-interactions.md` — Easing curves, page load sequence timing, scroll reveals, hover interactions, particle field, reduced motion.
- `docs/research/README.md` — Table of contents for all 14 knowledge domains and their subtopics.

## Content Structure (14 Domains)

The research content in `docs/research/` is organized into 14 numbered directories (`01-fundamentals` through `14-hacker-mindset`). Each contains multiple markdown files covering subtopics. The domain registry in the app maps these to URL slugs, Phosphor icons, and spectral accent colors.

## Design System Key Values

Background: `#080C15` (abyss). Accent palette: violet `#A78BFA`, sky `#7DD3FC`, emerald `#34D399`, pink `#F472B6`, amber `#FB923C`. Ghost white: `#F0F4FF`. All tokens are CSS custom properties defined in `globals.css` — never use raw hex values in components.

## Git Commit Convention

- **Never** include `Co-Authored-By` or any co-author trailer in commit messages.
- Commit message format: imperative mood, concise subject line (≤72 chars), optional body separated by blank line.
- Prefix subjects with the phase or area of work:
  - `feat:` — new feature or component
  - `fix:` — bug fix
  - `style:` — CSS/design changes only
  - `refactor:` — code restructuring, no behavior change
  - `docs:` — documentation changes
  - `chore:` — config, dependencies, build tooling

Example:
```
feat: add ghost SVG logo component with float animation

Implements the GhostLogo React component with idle float,
eye blink, and hover glow interactions per 04-components spec.
```

## Build Commands (once Phase 1 is complete)

```bash
npm run dev        # local dev server
npm run build      # static production build
npm run start      # serve production build locally
npm run lint       # ESLint
```
