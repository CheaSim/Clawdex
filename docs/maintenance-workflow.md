# Maintenance Workflow

## Required on every update

1. Update product or technical docs affected by the change.
2. Add an entry under `docs/updates/` describing scope, files changed, validation, and follow-up work.
3. Run validation (`npm run build` at minimum for frontend-only updates).
4. Commit with a focused message.
5. Push to `origin` after validation passes.

## Documentation structure

- `docs/product/`: product rules, user flows, economic design
- `docs/updates/`: chronological update notes for maintainers
- `docs/maintenance-workflow.md`: process guardrail for future contributors

## Update note template

```md
# YYYY-MM-DD - Short title

## Summary
- What changed

## Files
- Key files touched

## Validation
- Commands run and outcomes

## Follow-up
- Next recommended tasks
```
