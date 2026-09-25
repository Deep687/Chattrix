# M7 — Answer trace

**Goal:** every answer can show *how* it was produced. Interviewers remember seeing the internals.

## Scope
- Persist a trace per question: retrieved chunk ids + scores, chunks filtered out by permission
  (count only for members), rerank order, per-stage latency (embed / search / rerank / generate),
  tokens, cost estimate.
- "How this was answered" panel under each answer.
- Owner metrics view: questions per day, p95 latency, cost per answer, "I don't know" rate.

## Out of scope
External observability vendors.

## Acceptance criteria
- [ ] Trace available for every answer, viewable by the asker.
- [ ] Members see "N chunks hidden by permissions", never their content or titles.
- [ ] Traces store ids and numbers only — no document text or prompts in logs.
- [ ] Metrics view scoped to the workspace; no cross-tenant aggregation.

## Tests
- Trace written for each ask; stage timings sum sensibly.
- Member trace does not expose restricted chunk ids/titles.
- Non-member cannot read another workspace's traces.

## Unresolved questions
1. Trace retention period?

## Notes
