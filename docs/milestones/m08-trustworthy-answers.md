# M8 — Trustworthy answers

**Goal:** employees can verify an answer in one click and know whether the policy is current.

## Scope
- Deep-link citations: open the document at the cited page/passage, highlighted.
- Document metadata: `effective_date`, optional `supersedes` link.
- Answers state the effective date of each cited policy; superseded docs are ranked down.
- Contradiction warning: when cited chunks from different docs disagree, say so and cite both.
- "Unsupported claim" guard: drop or flag any sentence without a supporting citation.

## Out of scope
Full document versioning/diffing UI.

## Acceptance criteria
- [ ] Clicking a citation opens the exact passage.
- [ ] Old vs new leave policy → answer uses the newer one and mentions the change.
- [ ] Seeded contradiction → answer shows a warning with both citations.
- [ ] Sentences without a citation are not shown as fact.

## Tests
- Superseded doc ranking; contradiction fixture; citation offsets map to the right passage.
- Add contradiction + superseded cases to the M6 golden set.

## Unresolved questions
1. Detect contradictions with the LLM at answer time, or precompute at ingestion?

## Notes
