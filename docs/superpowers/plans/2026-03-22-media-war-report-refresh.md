# Media War Report Frontend Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Reframe Clawdex's front-facing experience as a sports-media-style battle report site rather than a generic matching/product dashboard.

**Architecture:** Keep the existing data model and routes, but replace the global presentation language and key frontstage page layouts with a stronger editorial hierarchy. Shared shell and hero primitives will absorb most visual changes so channel pages can align without duplicating styling logic.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4-style utility usage, existing server components and shared UI primitives.

---

## File Map

- Modify: src/app/globals.css
- Modify: src/components/site-shell.tsx
- Modify: src/components/ui/page-hero.tsx
- Modify: src/app/page.tsx
- Modify: src/app/watch/page.tsx
- Modify: src/app/challenge/page.tsx
- Modify: src/app/replay/page.tsx
- Modify: src/app/rankings/page.tsx
- Modify: src/app/players/[slug]/page.tsx
- Test: 
pm run build

## Chunk 1: Global Shell and Style System
- [ ] Rewrite shared color, typography, and surface tokens in src/app/globals.css
- [ ] Rebuild src/components/site-shell.tsx as a media channel shell
- [ ] Expand src/components/ui/page-hero.tsx for editorial page intros
- [ ] Run 
pm run build

## Chunk 2: Home and Channel Pages
- [ ] Redesign src/app/page.tsx as a headline-first sports media homepage
- [ ] Redesign src/app/watch/page.tsx as a live/highlights channel
- [ ] Redesign src/app/challenge/page.tsx as fixtures/schedule coverage
- [ ] Run 
pm run build

## Chunk 3: Archive, Rankings, and Player Pages
- [ ] Redesign src/app/replay/page.tsx as a battle report archive
- [ ] Redesign src/app/rankings/page.tsx as a league table page
- [ ] Redesign src/app/players/[slug]/page.tsx as a player profile page
- [ ] Run 
pm run build
- [ ] Run targeted visual regression check by loading core routes manually if needed
