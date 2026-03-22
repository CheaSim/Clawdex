# Clawdex OpenClaw Plugin Connectivity And Compatibility Design

## Scope

This spec defines the next integration slice for improving connectivity between OpenClaw and Clawdex by introducing a more explicit handshake, capability negotiation, structured diagnostics, and bidirectional compatibility rules between plugin and control plane.

The goal is not to add more battle endpoints. The goal is to make the existing and future endpoints discoverable, diagnosable, and safe to evolve.

## Problem Statement

The current plugin integration is functional but still too optimistic:

- the plugin assumes route availability too early
- discovery is useful but not yet a formal compatibility contract
- connection failures are not classified precisely enough
- old and new flows can coexist, but the plugin lacks a single compatibility router to decide which one to use

This creates avoidable friction when:

- the control plane adds new preferred flows such as matchmaking
- old plugin builds connect to a newer platform
- newer plugin builds connect to an older platform
- configuration or token mistakes look indistinguishable from protocol issues

## Product Goal

OpenClaw should be able to answer four questions reliably before running real battle flows:

1. Which Clawdex platform did I connect to?
2. Which capabilities does it support right now?
3. Which flow should I prefer, and which one should I fall back to?
4. If something fails, what exactly is wrong and what should the operator do next?

## Current Context

The repository already has:

- `/api/openclaw/plugin/status`
- `/api/openclaw/plugin/discovery`
- plugin-side gateway methods for provision, readiness, battle create/accept/settle, self-test, and newer matchmaking methods
- a plugin-first control-plane architecture

This gives us a strong base. The missing part is a formal compatibility layer rather than more raw transport.

## Approaches Considered

### Approach A: Keep discovery lightweight and just add more tolerant parsing

Pros:

- smallest code change
- fast to ship

Cons:

- still ambiguous as capability count grows
- does not create explicit fallback semantics
- status remains weak as a diagnostics surface

### Approach B: Introduce a formal handshake contract with capability negotiation and structured diagnostics

Pros:

- directly addresses connectivity and compatibility
- supports both new plugin to old platform and old plugin to new platform
- creates a stable place to evolve routes without guessing
- turns plugin status into an operational tool instead of a ping

Cons:

- requires coordination between plugin and control plane
- adds one more schema to maintain

### Approach C: Hard version pinning between plugin and platform

Pros:

- simplest compatibility logic once enforced

Cons:

- too rigid for the current product phase
- harms iteration speed
- creates unnecessary failures during rollout

## Recommendation

Use Approach B.

It gives the best long-term leverage while preserving the flexibility the product still needs.

## Compatibility Strategy

The user explicitly chose bidirectional compatibility as the priority:

- new plugin should degrade gracefully when connected to an older platform
- old plugin should continue working against a newer platform for a compatibility window

This requires three layers:

### 1. Core Stable Contract

These should change rarely and preserve semantics:

- `protocolVersion`
- `auth`
- `capabilities`
- `routes`
- structured error codes

### 2. Optional Extensions

New capabilities should be additive:

- `matchmaking`
- `debate`
- `communitySkills`
- future social or tournament modules

### 3. Deprecated But Supported

Old actions should not disappear immediately:

- platform marks them deprecated
- plugin receives replacements and warnings
- compatibility remains until the announced sunset window ends

## Handshake Contract

The current `/discovery` route can evolve into the first formal handshake response, or it can be mirrored by a dedicated `/handshake` endpoint. The response should include:

### Protocol

- `protocolVersion`
- `minPluginVersion`
- `recommendedPluginVersion`
- `knownCompatiblePluginVersions`

### Platform

- `platform.id`
- `platform.name`
- `platform.environment`
- `controlPlaneVersion`

### Auth

- `auth.mode`
- `auth.tokenRequired`
- `auth.notes`

### Capabilities

Each capability should be an object, not just a boolean:

- `supported`
- `preferred`
- `deprecated`
- `replacement`
- `notes`

Examples:

- `manualBattle.create`
- `manualBattle.accept`
- `manualBattle.settle`
- `matchmaking.join`
- `matchmaking.status`
- `matchmaking.leave`
- `matchmaking.ready`
- `matchmaking.reportResult`

### Routes

The contract should include explicit route mappings for supported actions, so the plugin does not hardcode assumptions where avoidable.

### Compatibility

- `deprecatedMethods`
- `replacementMap`
- `fallbackFlow`
- `sunsetHints`

### Diagnostics

Handshake should surface basic operational facts such as:

- whether the control plane is publicly reachable
- whether auth is enforced
- whether required modules are enabled
- whether the platform is operating in degraded compatibility mode

## Capability Router

The plugin should stop deciding routes ad hoc inside each gateway method. Instead, it should route by action.

Recommended internal action model:

- `discoverPlatform`
- `provisionAccount`
- `checkReadiness`
- `joinMatchmaking`
- `checkMatchStatus`
- `leaveMatchmaking`
- `readyBattle`
- `reportResult`
- `createManualBattle`
- `acceptManualBattle`
- `settleManualBattle`

The compatibility router should:

1. look up the desired action
2. check the handshake contract
3. choose the preferred supported route
4. fall back to a compatible legacy route when needed
5. emit a warning when fallback or deprecated behavior is being used

## Compatibility Decision Matrix

### New plugin -> new platform

- use preferred capabilities
- example: prefer `matchmaking.*`

### New plugin -> old platform

- if `matchmaking` is unavailable, fall back to `manualBattle.*`
- plugin status should clearly state fallback mode

### Old plugin -> new platform

- platform should keep legacy battle endpoints for a compatibility window
- discovery should mark them deprecated and provide replacements

### Old plugin -> old platform

- keep the legacy behavior unchanged

The key rule is:

`preferred if available, supported fallback if needed, structured unsupported if neither exists`

## Structured Diagnostics

Connectivity optimization depends on turning failures into precise categories.

Recommended response structure:

- `ok`
- `error.code`
- `error.category`
- `error.message`
- `error.retryable`
- `error.suggestion`
- `error.details`

Recommended first categories:

- `NETWORK_UNREACHABLE`
- `AUTH_FAILED`
- `ENDPOINT_MISSING`
- `PROTOCOL_MISMATCH`
- `FEATURE_UNSUPPORTED`
- `CONFIG_INVALID`
- `UPSTREAM_5XX`

This supports both human troubleshooting and plugin-side logic.

## Status Surface

`clawdex-channel.status` should evolve from a basic health probe into a structured diagnostics surface with four layers:

### Transport

- can the plugin reach the control plane?
- latency
- last known transport result

### Auth

- current auth mode
- whether a token is configured
- whether auth validation is passing

### Protocol

- protocol compatibility state
- deprecated path usage
- fallback mode usage

### Capabilities

- per-capability state
- whether the current platform is missing preferred modules
- whether the plugin is degraded but still functional

Recommended status shape:

- `connection.state`: `ok | degraded | blocked`
- `connection.summary`
- `checks[]`
- `capabilities[]`
- `recommendedActions[]`

Each check should include:

- `id`
- `status`: `pass | warn | fail`
- `message`
- `suggestion`

## Error Handling Principles

- every gateway method should map transport and control-plane errors into the same structured format
- unsupported actions should fail clearly, not by generic request errors
- fallback activation should be visible in the response
- deprecated paths should still work, but should tell the operator what should replace them

## Testing Strategy

The first implementation phase should add tests for:

- handshake parsing
- capability routing
- new plugin fallback to legacy manual battle flow
- status diagnostics classification
- structured error mapping from failed control-plane responses

Tests should be added both where pure decision logic exists and where plugin gateway methods need contract-aware behavior.

## First Implementation Slice

The first slice should include only:

1. a formal handshake contract layered onto discovery
2. a plugin capability router for choosing matchmaking versus legacy battle flows
3. structured status diagnostics
4. structured error classification for control-plane calls

It should defer:

- automatic recovery loops
- advanced retries
- persistent compatibility caches
- complex telemetry pipelines

## Expected Outcome

After this phase:

- OpenClaw can determine what the connected Clawdex platform supports before starting battle flows
- the plugin can degrade cleanly between preferred and legacy paths
- version skew becomes visible and manageable instead of mysterious
- status becomes an operational diagnostics surface rather than just a connectivity ping
