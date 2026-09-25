# M2 — It answers

**Goal:** an employee asks a question and gets a grounded, cited, streamed answer — or an honest
"I don't know." **Demoable core.**

## Scope
- `RagService::ask()`: embed question → workspace-filtered pgvector top-K → grounded prompt →
  generate → `{ answer, citations[], usage }`.
- Prompt contract from `migration.plan.md` (context-only, cite every claim, "I don't know").
- `AskController` + `AskQuestionRequest` + `AskAnswerResource`.
- Streaming (SSE) through the Next.js BFF.
- Frontend: `AskPanel` — question box, streamed answer, citation chips revealing the source chunk.

## Out of scope
Hybrid search / rerank (M6), trace panel (M7), deep-link citations (M8).

## Acceptance criteria
- [ ] Answers cite at least one chunk for every factual claim.
- [ ] Question not covered by docs → "I don't know based on the provided documents."
- [ ] Tokens stream to the UI; errors mid-stream show a clean message.
- [ ] Retrieval filters by `workspace_id` in the SQL itself.
- [ ] Rate-limited per user.

## Tests
- Happy path with faked provider: answer + citations shape.
- Empty workspace / no relevant chunks → "I don't know".
- Provider timeout → graceful error, no partial garbage saved.
- Non-member → 403.

## Unresolved questions
1. Top-K value to start with (5? 8?).
2. Persist Q&A history now, or only in M7/M11?

## Notes
