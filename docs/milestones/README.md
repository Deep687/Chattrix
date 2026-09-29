# Chattrix Milestones

Positioning and rationale: [`migration.plan.md`](../../migration.plan.md) → *Positioning v2*.
One file per milestone. Each is a ship-gate: don't start the next until the gate is green.

| # | Milestone | Status | Depends on |
| --- | --- | --- | --- |
| [M1](m01-it-embeds.md) | It embeds | ☐ | — |
| [M2](m02-it-answers.md) | It answers | ☐ | M1 |
| [M3](m03-its-isolated.md) | It's isolated | ☐ | M2 |
| [M4](m04-deploy-readme.md) | Deploy + README | ☐ | M3 |
| [M5](m05-permission-aware-retrieval.md) | Permission-aware retrieval | ☐ | M3 |
| [M6](m06-measured-quality.md) | Measured quality | ☐ | M2 |
| [M7](m07-answer-trace.md) | Answer trace | ☐ | M2 |
| [M8](m08-trustworthy-answers.md) | Trustworthy answers | ☐ | M2 |
| [M9](m09-mcp-server.md) | MCP server | ☐ | M5, AgentGate v1 |
| [M10](m10-actions-with-approval.md) | Actions with approval | ☐ | M5 |
| [M11](m11-admin-value.md) | Knowledge gaps + Slack | ☐ | M2 |

**Stand-out threshold:** M1–M7. **Parked:** FastAPI/LangChain extraction.

## Rules for every milestone

- One branch + one PR per milestone.
- Tests on Postgres (pgvector), never sqlite.
- Every retrieval path filters by `workspace_id` in the query **and** passes `WorkspacePolicy`.
- No document content, prompts, or answers in logs — ids, counts, and timings only.
- Update the status box above and the milestone's *Notes* when done.
