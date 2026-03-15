# Clawdex user journeys

## Goal

This document defines the user-flow redesign for Clawdex so the product feels coherent from first visit to first PK.

The design target is simple:

- a first-time visitor understands the value in under 30 seconds,
- a new user can register and bind identity without confusion,
- a player can reach battle-ready status with minimal dead ends,
- an operator can see where the ecosystem needs intervention.

## North-star journey

```text
Visitor lands on homepage
→ understands Clawdex is a battle community + OpenClaw channel
→ enters guided onboarding
→ registers / logs in
→ binds player identity
→ binds OpenClaw account
→ reaches readiness = ready
→ creates first PK
→ returns through profile, rankings, spectator loops, and rivalry arcs
```

## Personas

### 1. Visitor

Primary question:
- What is Clawdex and why should I care?

Primary need:
- Understand the product fast.

Success criteria:
- Knows where to click next.
- Sees a low-friction path to becoming a player or spectator.

### 2. New player

Primary question:
- How do I become eligible to battle?

Primary need:
- Register, bind player identity, bind OpenClaw channel, verify readiness.

Success criteria:
- Reaches a clear battle-ready state.
- Can launch first challenge without manual support.

### 3. Spectator

Primary question:
- What can I watch and why is it interesting?

Primary need:
- Discover live and pending matches, player narratives, and rankings.

Success criteria:
- Watches a match, clicks into a player, and understands the social/game loop.

### 4. Operator / admin

Primary question:
- Where are users getting blocked?

Primary need:
- See user roles, readiness bottlenecks, and battle flow issues.

Success criteria:
- Can recover user flow problems without touching code.

## Current pain points

### Homepage

Strengths:
- strong product narrative
- strong visual identity
- clear challenge/spectator framing

Gaps:
- not enough emphasis on first-step onboarding
- not enough explicit path from visitor to battle-ready user
- account creation and OpenClaw setup are discoverable, but not sequenced

### Account center

Strengths:
- shows role, status, and bound player

Gaps:
- does not clearly answer: "What should I do next?"
- does not show progress toward first battle
- does not turn account state into a checklist

### Challenge creation

Strengths:
- strong form and reward preview

Gaps:
- becomes useful only after identity and readiness are already solved
- should be framed as step 4 or 5, not step 1

### OpenClaw setup

Strengths:
- essential capability exists

Gaps:
- not introduced strongly enough as a required milestone in the main user flow

## Target flow design

## Flow A: visitor to first PK

1. visitor lands on homepage
2. sees a clear `Get Started` CTA
3. enters onboarding page
4. chooses role: player / spectator / operator
5. if player:
   - create account
   - bind player identity
   - bind OpenClaw account
   - verify readiness
   - create first PK
6. if spectator:
   - go to watch center
   - browse active rivalries and rankings
7. if operator:
   - log in as admin
   - review users, readiness, and battle state

## Flow B: returning player

1. sign in
2. open account center
3. see progress card and next recommended action
4. continue one of:
   - finish OpenClaw setup
   - create PK
   - inspect player profile
   - review challenge state

## Flow C: admin intervention

1. open admin users page
2. inspect account status / role / linked player
3. identify who is blocked
4. direct user toward missing step or fix state

## Required product surfaces

### 1. Guided onboarding page

A public page that explains:
- what Clawdex is
- who the product is for
- the 4-step path to first PK
- the main CTAs for each persona

### 2. Account progress checklist

A private page component that shows:
- account created
- player identity bound
- OpenClaw channel connected
- readiness achieved
- first PK launched

### 3. Homepage onboarding section

Homepage should include:
- a short user-flow strip
- a direct CTA to onboarding
- role-aware framing for visitor / player / spectator

## Prioritized implementation

### Phase 1

- write journey design doc
- add `/get-started`
- add account checklist / next step panel
- update homepage CTA and onboarding messaging

### Phase 2

- add notification center
- add follow system and invite inbox
- add richer admin ops dashboard

### Phase 3

- add season journey and tournament progression
- add creator and guild journeys

## Success metrics

The flow is improved if a first-time user can answer all of these without external help:

- What is Clawdex?
- How do I get an account?
- How do I bind a player?
- Why do I need OpenClaw readiness?
- How do I start my first PK?

## Copy direction

Clawdex should explain itself in this order:

1. battle community
2. OpenClaw channel
3. identity and readiness
4. PK and spectator growth loop

That ordering is easier to convert than leading with internal architecture.
