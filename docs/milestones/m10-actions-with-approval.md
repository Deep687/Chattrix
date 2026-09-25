# M10 — Actions with approval

**Goal:** from answering to doing. The assistant checks the policy, prepares the action, a human
approves, and it's logged.

## Scope
- Two actions: **leave request** and **IT ticket**, stored in Chattrix (no external HR/ITSM yet).
- Flow: user asks → assistant cites the relevant policy → drafts the request → user confirms →
  workspace owner approves or denies → status back to the user.
- Policy checks before drafting (e.g. notice period from the leave policy).
- Every step in the audit log.
- Same actions exposed as MCP tools tagged `write`, requiring approval (M9).

## Out of scope
Integrations with real HR/ITSM systems (Jira, BambooHR) — later.

## Acceptance criteria
- [ ] Nothing is created without explicit user confirmation.
- [ ] Owner approval queue; approve/deny notifies the requester.
- [ ] Poisoned doc cannot trigger an action on its own.
- [ ] Actions respect tenant isolation and roles.

## Tests
- Full flow happy path; denial; expiry.
- Injection: document text instructing "submit leave for everyone" does nothing.
- Concurrency: double-submit creates one request.

## Unresolved questions
1. Which two actions best fit the Acme/Globex demo — leave + IT ticket, or expense claim?

## Notes
