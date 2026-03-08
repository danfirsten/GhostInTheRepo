# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ghost in the Repo is a reference platform for software engineers with user accounts, progress tracking, and an achievement system. Content pages are statically generated; auth and user data are powered by Supabase.

**Stack:** Next.js 16 (App Router), TypeScript, CSS Modules + CSS Custom Properties, Shiki (custom "Spectral" syntax theme), Phosphor Icons, Fuse.js (client-side search), D3.js (knowledge graph), Framer Motion (graph + page transitions only), Supabase (auth + PostgreSQL + RLS).

## Key Architecture Decisions

- **Hybrid static + server.** Content pages are statically generated at build time. Auth, user data, and progress tracking use Supabase via API routes and middleware.
- **Supabase for auth and data.** Google OAuth + email/password login. User profiles, progress tracking, badges, and bookmarks stored in PostgreSQL with Row Level Security.
- **CSS-first animations.** Use CSS keyframes and transitions for everything except the D3.js knowledge graph and page transitions (Framer Motion).
- **Self-hosted fonts via `next/font/google`.** Fraunces (display), Syne (UI), Epilogue (body), JetBrains Mono (code).
- **Content sourced from `docs/research/`** — 14 domains of markdown files parsed at build time with `gray-matter`.

## Documentation (Read Before Building)

All design and architecture specs live in `docs/`:

- `docs/implementation_plan.md` — **The original build plan.** 11 phases for the static platform (Phases 1–10 complete, Phase 11 pending).
- `docs/implementation_plan_user_system.md` — **User system plan.** Phases 12–16: auth, profiles, progress tracking, badges, and polish.
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
npm run build      # production build (hybrid static + server)
npm run start      # serve production build locally
npm run lint       # ESLint
```
