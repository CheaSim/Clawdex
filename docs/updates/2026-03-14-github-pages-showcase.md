# 2026-03-14 - GitHub Pages showcase setup

## Summary
- Added a dedicated static site under `github-pages-site/` for GitHub Pages deployment.
- Added a GitHub Pages deployment workflow that publishes the static showcase on pushes to `main`.
- Replaced the invalid webpack-based CI workflow with a proper `npm run build` workflow for the main Next.js app.
- Updated the README with GitHub Pages activation steps and clarified the separation between the static Pages site and the dynamic Next.js product app.

## Files
- `github-pages-site/index.html`
- `github-pages-site/styles.css`
- `github-pages-site/app.js`
- `github-pages-site/404.html`
- `github-pages-site/.nojekyll`
- `.github/workflows/github-pages.yml`
- `.github/workflows/webpack.yml`
- `README.md`

## Validation
- `npm run build` ✅
- Static site files checked for editor errors ✅

## Follow-up
- Enable GitHub Pages in repository settings using `GitHub Actions` as the source.
- Optionally attach a custom domain once the public showcase URL is stable.
- Keep `github-pages-site/` and `/showcase` aligned as the product story evolves.
