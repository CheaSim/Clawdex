# 2026-03-14 - Visual design polish

## Summary
- Introduced a reusable visual layer with shared hero, surface-card, and mobile tab bar components.
- Upgraded the global styling with layered backgrounds, buttons, pills, glass panels, and polished scrollbar treatment.
- Refined the home, watch, challenge, rankings, and rules pages to use a more product-grade layout rhythm and consistent styling.

## Files
- `src/components/ui/page-hero.tsx`
- `src/components/ui/surface-card.tsx`
- `src/components/ui/mobile-tab-bar.tsx`
- `src/components/site-shell.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/watch/page.tsx`
- `src/app/challenge/page.tsx`
- `src/app/rankings/page.tsx`
- `src/app/rules/page.tsx`

## Validation
- `npm run build` ✅

## Follow-up
- Add active navigation state and authenticated header behavior.
- Replace placeholder visual metrics with backend-driven live values.
- Introduce a proper design token file if the visual system keeps expanding.
