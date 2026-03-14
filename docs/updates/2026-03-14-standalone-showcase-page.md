# 2026-03-14 - Standalone showcase page

## Summary
- Added a dedicated `/showcase` route as a standalone public-facing product presentation page.
- Exposed the showcase page through navigation and homepage CTAs so it can be shared independently from the app homepage.
- Added GitHub / webpack guidance to the README to clarify why the current Next.js app is not a direct GitHub Pages fit and what deployment path makes sense.

## Files
- `src/app/showcase/page.tsx`
- `src/components/showcase/product-showcase.tsx`
- `src/data/site-content.ts`
- `src/app/page.tsx`
- `README.md`

## Validation
- `npm run build` ✅

## Follow-up
- If needed, split `/showcase` into a static-marketing-only build for GitHub Pages or social sharing.
- Add motion and media assets to the showcase page for higher presentation quality.
- Revisit deployment architecture once real auth and database layers are introduced.
