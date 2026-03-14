# 2026-03-14 - GitHub Pages enablement fix

## Summary
- Updated the GitHub Pages deployment workflow to auto-enable Pages on first run using the `enablement` option of `actions/configure-pages`.
- Documented the first-run behavior and the fallback manual step when repository or organization policy prevents automatic enablement.

## Files
- `.github/workflows/github-pages.yml`
- `README.md`

## Validation
- `npm run build` ✅
- Workflow and docs files checked for editor errors ✅

## Follow-up
- If the repository belongs to an organization with restricted Pages administration, manually set Pages source to `GitHub Actions` in repository settings and rerun the workflow.
- After the first successful deployment, verify the published URL and, if needed, add a custom domain.
