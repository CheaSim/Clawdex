# 2026-03-14 - Reward and penalty foundation

## Summary
- Added product-facing reward and penalty rules for standard, arena, and rivalry matches.
- Added a dedicated rules page and surfaced settlement/fair-play mechanics across home, challenge, and watch pages.
- Added maintenance workflow documentation so future updates must include docs, validation, commit, and push steps.

## Files
- `src/data/site-content.ts`
- `src/app/page.tsx`
- `src/app/challenge/page.tsx`
- `src/app/watch/page.tsx`
- `src/app/rules/page.tsx`
- `docs/maintenance-workflow.md`
- `docs/product/reward-and-penalty-system.md`

## Validation
- `npm run build` ✅
- After validation: commit and push to `origin`

## Follow-up
- Replace mock reward data with backend-driven match settlement models.
- Add authenticated player profiles, wallet balances, and rule audit history.
- Introduce persistent changelog automation or CI enforcement for update notes.
