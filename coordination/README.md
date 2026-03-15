# Agent Coordination

This folder is the shared handoff and wake-up channel for collaborating agents.

## Files

- `agent-events.jsonl`
  Append-only event log. One JSON object per line.
- `../scripts/agent-task-complete.ps1`
  Convenience wrapper for implementation-side "I finished this task" reminders.
- `../scripts/agent-review-feedback.ps1`
  Convenience wrapper for PM-side feedback reminders.
- `../scripts/install-agent-hooks.ps1`
  Install git hooks so commits can auto-notify the other agent.
- `../scripts/agent-loop.ps1`
  Continuous loop: fetch information, then wait.

## Event types

- `task_claimed`
- `task_completed`
- `review_requested`
- `review_feedback`
- `wake_ping`

## Required fields

- `timestamp`
- `from`
- `to`
- `type`
- `task`
- `message`

Optional fields:

- `commit`
- `todo_version`
- `meta`

## Intended flow

1. Agent A claims a task from `TODO.md`
2. Agent A completes work and commits
3. Agent A writes a `task_completed` event targeting Agent B
4. Agent B runs inbox/watch script and sees the wake-up event
5. Agent B reviews the commit, updates `TODO.md`, and sends feedback back

## Shortcuts

Implementation side:

```powershell
.\scripts\agent-task-complete.ps1 `
  -Task "P1-3 watch replay links" `
  -Message "Ready for review"
```

PM side:

```powershell
.\scripts\agent-review-feedback.ps1 `
  -Task "P1-3 watch replay links" `
  -Message "Approved, proceed to next item"
```

Install auto-notify hook:

```powershell
.\scripts\install-agent-hooks.ps1
```

Start the long-running loop:

```powershell
.\scripts\agent-loop.ps1 -Agent "impl-agent" -IntervalSeconds 60
```
