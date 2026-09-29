# M11 — Knowledge gaps + Slack

**Goal:** give the admin a reason to pay, and meet employees where they already ask.

## Scope
- 👍/👎 on answers (web + Slack).
- Knowledge-gaps report for owners: most frequent "I don't know" and 👎 questions, clustered,
  with "no document covers this" suggestions.
- Slack app: OAuth install per workspace, `app_mention` + DM events, signature verification,
  ack within 3 s and answer from a queued job, threaded reply with citations.
- Slack user ↔ Chattrix member mapping; unmapped users get a link to join.

## Out of scope
Microsoft Teams (same adapter later).

## Acceptance criteria
- [ ] Gaps report lists top unanswered topics for the workspace only.
- [ ] Slack answers respect M5 permissions for the mapped user.
- [ ] Invalid Slack signatures rejected; retries don't double-answer.
- [ ] Bot tokens encrypted at rest.

## Tests
- Signature verification (valid, invalid, replayed).
- Event idempotency on Slack retries.
- Unmapped Slack user gets no answer.

## Unresolved questions
1. Question clustering: embeddings-based, or simple LLM grouping?

## Notes
