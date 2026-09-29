# M6 — Measured quality

**Goal:** answer "how do you know it got better?" with numbers — and fail the build when it gets
worse.

## Scope
- Golden set: ~15–20 questions per company for `seed-data/golden-questions.csv` (file not created yet), each with the
  expected answer and expected source chunk; include cross-tenant and permission probes.
- `RagEvalService` + artisan command: recall@k, precision@k, MRR, faithfulness (LLM-as-judge),
  "I don't know" correctness.
- CI job runs evals; fails below a stored baseline.
- Hybrid retrieval (pgvector + Postgres full-text, reciprocal rank fusion).
- Reranking top-20 → top-5 with a free cross-encoder.
- README table: baseline → hybrid → hybrid + rerank.

## Out of scope
Fine-tuning, model switching experiments.

## Acceptance criteria
- [ ] Eval command prints a metrics table and writes a JSON report.
- [ ] CI fails when recall@5 or faithfulness drops below baseline.
- [ ] Measured before/after numbers for hybrid and rerank are in the README.
- [ ] Eval runs don't hit the free-tier rate limit (cached embeddings, throttling).

## Tests
- Metric functions (unit): known inputs → known recall/MRR.
- Eval command with a faked provider.

## Unresolved questions
1. Run the LLM-judge in CI on every PR, or nightly to save quota?
2. Which cross-encoder, and where does it run (PHP can't host it — tiny sidecar or hosted free API)?

## Notes
