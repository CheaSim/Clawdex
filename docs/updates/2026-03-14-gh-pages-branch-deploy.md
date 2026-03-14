# 2026-03-14 - GitHub Pages branch deployment fix

## Summary
- Replaced the API-based GitHub Pages deployment workflow with a branch-based deployment to `gh-pages`.
- Removed the dependency on `actions/configure-pages`, which was failing because the workflow token could not create a Pages site for this repository.
- Updated the README so GitHub Pages now uses `Deploy from a branch` with `gh-pages` as the source.

## Files
- `.github/workflows/github-pages.yml`
- `README.md`

## Validation
- `npm run build` ✅
- Workflow and docs files checked for editor errors ✅

## Follow-up
- In repository Settings → Pages, set source to `Deploy from a branch` and branch to `gh-pages`.
- Re-run the `Deploy GitHub Pages showcase` workflow or push a new commit to `main`.
- After the first successful deploy, verify the site at the project Pages URL.
