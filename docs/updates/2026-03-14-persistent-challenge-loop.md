# 2026-03-14 - Persistent challenge loop

## Summary
- Added a file-backed mock database to persist player wallets and challenge records across challenge creation and acceptance flows.
- Reworked challenge APIs to create real challenge records, expose challenge detail payloads, and accept pending challenges while freezing both players' stakes.
- Added a challenge detail page with accept action UI and connected the arena and player profile views to the new persistent challenge records.
- Surfaced wallet constraints in the player profile and challenge creation flow so stakes now have visible balance requirements.

## Files
- `data/mock-db.json`
- `src/data/product-data.ts`
- `src/lib/mock-db.ts`
- `src/app/api/challenges/route.ts`
- `src/app/api/challenges/[id]/route.ts`
- `src/app/api/challenges/[id]/accept/route.ts`
- `src/app/api/players/[slug]/route.ts`
- `src/app/challenge/page.tsx`
- `src/app/challenge/[id]/page.tsx`
- `src/app/players/[slug]/page.tsx`
- `src/components/challenge/challenge-creator-form.tsx`
- `src/components/challenge/detail/challenge-detail-actions.tsx`

## Validation
- `npm run build` ✅

## Follow-up
- Replace the repo JSON store with a real database and user identity so challenge acceptance is tied to authenticated players.
- Add settlement completion, wallet release, and reward distribution after a match finishes.
- Add challenge filters and feed surfacing on the homepage to promote newly created high-stakes matches.
