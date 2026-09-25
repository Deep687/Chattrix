# M9 — MCP server (via AgentGate)

**Goal:** employees use Chattrix knowledge from Claude, ChatGPT or Cursor — with the same
tenant isolation, permissions and audit as the web app. Chattrix becomes AgentGate's showcase.

## Scope
- Install AgentGate (`~/Herd/agentgate/FEATURES.md`): OAuth for agents on behalf of a user.
- MCP tools: `search_policies`, `ask_policy_question` (read-only).
- Consent screen + "Connected agents" page per user; revoke.
- Owner controls: allow/block agents for the workspace.
- Every agent call written to the audit log (agent, user, tool, outcome).

## Out of scope
Write actions (M10).

## Acceptance criteria
- [ ] Claude Desktop connects, authenticates as a member, and gets cited answers.
- [ ] Member-connected agent cannot see owner-only docs (M5 rules apply).
- [ ] Agent for Acme can never reach Globex.
- [ ] Revoking the agent fails its next call immediately.

## Tests
- Reuse M3/M5 suites through the MCP path.
- Token scope, expiry, revocation.

## Depends on
AgentGate v1 (identity, MCP adapter, policy, audit).

## Unresolved questions
1. Build M9 inside Chattrix first and extract into AgentGate, or AgentGate first?

## Notes
