# Agent Wake-Up Mechanism

## Goal

Replace the fragile "manually watch TODO.md" flow with a durable, low-friction reminder mechanism between two collaborating agents.

## Design

The mechanism is file-based so it works:

- locally
- without extra services
- inside git history
- with simple terminal tooling

## Components

### 1. Shared task source

- `TODO.md`

Still remains the source of truth for product priorities and PM review comments.

### 2. Shared event bus

- `coordination/agent-events.jsonl`

Each event is append-only JSONL. This makes the protocol durable and easy to audit in git.

### 3. Scripts

- `scripts/agent-notify.ps1`
  Send an event to another agent.
- `scripts/agent-inbox.ps1`
  Read events addressed to one agent.
- `scripts/agent-watch.ps1`
  Poll `TODO.md` and the inbox every N seconds and emit visible reminders.

## Why this is better

- completion reminders are explicit, not inferred
- review handoff is durable
- git commit id can be attached to the reminder
- both sides can keep working asynchronously
- no external queue or server is required

## Recommended protocol

When the implementation agent finishes a task:

1. commit code
2. run:

```powershell
.\scripts\agent-notify.ps1 `
  -From "impl-agent" `
  -To "pm-agent" `
  -Type "task_completed" `
  -Task "P1-3 watch replay links" `
  -Message "Ready for review" `
  -Commit (git rev-parse --short HEAD)
```

When the PM agent finishes review:

1. update `TODO.md`
2. run:

```powershell
.\scripts\agent-notify.ps1 `
  -From "pm-agent" `
  -To "impl-agent" `
  -Type "review_feedback" `
  -Task "P1-3 watch replay links" `
  -Message "Approved, proceed to next item"
```

## Optional workflow

Keep one terminal tab running:

```powershell
.\scripts\agent-watch.ps1 -Agent "impl-agent" -IntervalSeconds 60
```

This gives you the old "sleep and re-check" behavior, but with structured wake-up events layered on top.
