# M5 — Permission-aware retrieval

**Goal:** inside one company, not everyone may see every document. The same question returns
different answers depending on who asks — enforced in the vector query, not the UI.
**The feature ChatGPT can't match.**

## Scope
- Document audience: `everyone` (all members) | `owners` (owners only). Denormalised onto chunks
  so the retrieval `WHERE` can filter by it.
- Upload UI: pick audience; owners can change it later (re-stamps chunks).
- Retrieval filters by `workspace_id` **and** audience for the asker's role.
- Seed a restricted doc per company (e.g. "Salary bands", owners only).

## Out of scope
Custom roles / groups (later), Viewer role (still deferred per Decisions).

## Acceptance criteria
- [ ] Member asking about salary bands → "I don't know"; owner → cited answer.
- [ ] Changing audience takes effect on the next question (no stale chunks).
- [ ] Restricted chunks never appear in citations, streamed text, or error messages for members.
- [ ] Filter lives in the SQL; policy check is the second layer, not the only one.

## Tests
- Permission-leak test: member cannot retrieve owner-only chunks (and injection variant from M3).
- Audience change re-stamps all chunks atomically.
- Demo: add both roles to the README demo script.

## Unresolved questions
1. Is two audiences enough for the demo, or add a `groups` concept now?

## Notes
