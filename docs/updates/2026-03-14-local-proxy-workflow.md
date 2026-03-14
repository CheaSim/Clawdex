# 2026-03-14 - Local proxy workflow

## Summary
- Added PowerShell helper scripts to enable and clear the local `127.0.0.1:7899` proxy for this workspace.
- Documented how Docker Desktop and Git should use the local proxy.
- Added local proxy notes to the README.
- Applied Git global proxy settings locally for GitHub and git operations.

## Files
- `scripts/use-proxy.ps1`
- `scripts/clear-proxy.ps1`
- `docs/deployment/local-proxy.md`
- `README.md`

## Validation
- Files checked for editor errors ✅
- Git global proxy now points to `http://127.0.0.1:7899` ✅

## Follow-up
- If Docker pulls still fail, confirm Docker Desktop proxy settings also point to `http://127.0.0.1:7899` and restart Docker Desktop.
- Reuse `scripts/use-proxy.ps1` before local Docker or GitHub-heavy operations when a new terminal session starts.
