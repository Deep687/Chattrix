# Migration Plan — Chattrix → Secure Multi-Tenant RAG Knowledge Base

Evolve Chattrix into a **secure, multi-tenant RAG knowledge base** — reusing the auth and
workspace/membership model, adding a document → retrieval → generation layer, and treating
**tenant isolation, evaluation, and observability** as first-class, *provable* features.

> Companion overview + RAG explainer: `plan.html` (regenerate from this file after edits).
> Product definition + full access model (what the app is, what every role can and cannot do,
> the two role axes, capability matrix, enforcement layers): `docfordeep.html`.

---

## Vertical (locked) — Internal Policy & Compliance Assistant

Don't present this as a generic "knowledge base" — that reads as a tutorial and lands in the
crowded category. Aim the *same code* at one concrete workflow:

**Companies upload their internal policies — HR handbook, IT/security policy, leave & benefits,
code of conduct, compliance docs — and employees ask plain-English questions, getting grounded,
cited answers scoped strictly to their own company.**

Why this vertical:
- **Isolation IS the product.** "Company A's salary/leave policy must never appear in Company B's
  answer" makes tenant isolation the headline value prop, not a technical footnote — so the rarest
  differentiator leads.
- **Thematic coherence with existing work.** The project already showcases secure auth (token
  rotation, BFF). "I build secure systems" now spans the whole app instead of two unrelated skills.
- **Trivial, safe corpus.** Handbooks / IT policies are easy to write or source, and grading golden
  answers is easy because the docs are simple. No domain-expert risk (unlike legal/medical).
- **Instant recruiter recognition.** Everyone understands "ask HR/IT a question."

Each **workspace = one company**. Seed the demo with 2 fictional companies (e.g. "Acme" and
"Globex") each holding a handful of policy docs, so the isolation story is visible in the demo
itself. Keep the platform name **Chattrix**; position it as *"Chattrix — internal policy assistant."*

> **Seed corpus ready:** `seed-data/` holds both companies' policy docs (HR handbook, IT/security,
> benefits) plus `golden-questions.csv` (factual + negative + cross-tenant isolation probes). See
> `seed-data/README.md`. Acme and Globex are deliberately contrasting (India/INR/hybrid vs
> US/USD/remote) so leaks are obvious — same question returns each company's own answer.

---

## Positioning (why this beats the average "chat with PDF")

The portfolio market is saturated with single-user "chat with a PDF" demos. Three things
make this project rare — lean into all three, because they are exactly what interviewers probe:

1. **Secure multi-tenancy.** Chattrix already has real auth (token rotation, BFF, HttpOnly
   cookies) and a workspace membership model. Retrieval that *cannot* leak across tenants is
   a genuine production concern almost no demo handles. Make it a **tested, provable property**,
   not a claim.
2. **Measured quality.** Most demos have zero evaluation. A golden-question dataset plus
   retrieval + faithfulness metrics turns "it seems to work" into "I improved recall@5 from
   0.62 → 0.89 by adding a reranker."
3. **Production instrumentation.** Per-query token cost, latency, and retrieval traces. Shows
   you think about cost and reliability, not just the happy path.

**One-line pitch:** *"A multi-tenant internal-policy assistant that lets employees ask questions
against their own company's HR/IT/compliance docs — with workspace-isolated retrieval (proven by a
cross-tenant leak test), an automated RAG evaluation harness, and per-query cost/latency
observability. Next.js + Laravel, evolved into a Python/FastAPI AI service."*

---

## Guiding principle

**Reuse, don't rewrite.** Auth (token rotation, BFF, HttpOnly cookies), the `ApiResponser`
trait, Action/Service/Policy/Resource patterns, and the workspace membership model all stay.
RAG is an *addition*, not a replacement.

---

## Cleanup status ✅ (done)

- **Deleted dead code** — `chattrix-nest/`, `Post`/`Comment` models + migrations, the feed stub.
- **Full rename `hubs` → `workspaces`** (DB + code): model, controller, service, policy, requests,
  resources, role enum, actions, fresh `workspaces` + `workspace_user` migrations. Auth untouched.
- **Frontend stripped to auth + dummy dashboard** — hub UI, `/api/hubs` BFF routes, Redux hub
  state removed. Auth + profile kept.

RAG is built onto a clean `workspaces` base.

---

## Provider strategy (locked, consistent — resolves the earlier mix-up)

**Google Gemini free tier for everything, one key.** Zero cost, no credit card. Covers both
embeddings (`text-embedding-004`) and generation (`gemini-2.0-flash`). Get the key at
<https://aistudio.google.com>.

- Code is **provider-agnostic** behind an `EmbeddingProvider` / `ChatProvider` interface, so
  Claude/OpenAI/Voyage can be swapped by config later — but the *guide commits to Gemini only*
  end-to-end. No mixing providers in the same milestone.
- Reranking (Stage 2) uses a free cross-encoder rather than a paid rerank API, to stay $0.

---

## Ingestion pipeline (make the flow explicit)

```
Upload (pdf/txt/md)
      ↓  UploadDocumentAction  (status: pending)
Extract text        smalot/pdfparser / raw read
      ↓
Clean + normalise   strip boilerplate, fix whitespace
      ↓
Chunk               ~500 tokens, ~15% overlap, keep page/offset
      ↓
Embed (batch)       Gemini text-embedding-004
      ↓
Store vectors + metadata   (status: ready | failed)
      ↓
Ready for retrieval
```

**Retrieval path (Stage 1 → Stage 2):**
```
Question → embed → filter by workspace_id (ALWAYS) → vector search top-20
        → [Stage 2: rerank → top-5] → grounded prompt → LLM → answer + citations
```

Metadata travels with every chunk from day 1 — it is what makes tenant filtering and citations
work, so it is not optional.

---

## Stage 1 — ship first

- **DB:** PostgreSQL with **pgvector from day one** (`CREATE EXTENSION vector;`). The embedding
  column is a `vector` type; retrieval uses pgvector's `<=>` cosine-distance operator with an
  HNSW index. No in-PHP cosine loop — vector search is a core RAG skill, not an optimization, so
  we do it properly from the start. Enabling the extension is one line and needs no new infra.
- **Embeddings/Generation:** Gemini via Laravel `Http` facade.
- **Parsing:** `smalot/pdfparser`; read text/markdown directly.
- **Async:** existing DB queue + a new `EmbedDocumentJob`.
- **Grounded generation:** prompt enforces answer-only-from-context, cite sources, and
  say "I don't know" when the answer is absent (see prompt contract below).
- **Tenant isolation:** every retrieval query is scoped by `workspace_id` **before** the vector
  search (a `WHERE workspace_id = ?` combined with the ANN order-by), and gated by
  `WorkspacePolicy`. Enforced in the query, not just the UI.

> **pgvector setup:** needs the extension available on the Postgres server (local: `brew install
> pgvector` or the `pgvector/pgvector` Docker image; managed: Supabase/Neon/RDS ship it). Use the
> `pgvector/pgvector-laravel` package (or a raw migration) for the `vector` column + HNSW index.

---

## Stage 2 — hybrid retrieval + reranking + evals + observability (deeper RAG, still PHP)

Once Stage 1 works and is deployed. (pgvector is **not** here — it lands in Stage 1, see above.)

- **Hybrid retrieval:** combine vector similarity with Postgres full-text keyword search, then fuse
  (reciprocal rank fusion). Catches exact-term matches embeddings miss.
- **Reranking:** retrieve top-20, rerank to top-5 with a cross-encoder before generation. Measure
  the quality delta (this is a great interview story).
- **Context-window discipline:** cap injected context; document that retrieval *quality* beats
  *quantity* and that more chunks ≠ better answers.
- **Evaluation harness (first-class):** a golden dataset of question → expected-answer/expected-chunk
  pairs, run as an artisan command (and in CI). Measure:
  - *Retrieval:* precision@k, recall@k, MRR.
  - *Generation:* groundedness/faithfulness (is every claim supported by a cited chunk?),
    answer relevance. Use an LLM-as-judge (Gemini) for faithfulness scoring.
  - Track scores over time so changes (reranker, chunk size) show measurable improvement.
- **Observability:** log per-query token counts, provider cost estimate, latency (embed / search /
  rerank / generate breakdown), and which chunks were retrieved. Surface a small admin metrics view.

Still 100% PHP/Laravel.

---

## Stage 3 — Extract AI into a Python / FastAPI service (career evolution)

**Why:** the AI ecosystem (LangChain, LlamaIndex, Hugging Face, latest research) is Python-first.
"Laravel + Next.js + Python for AI" is the strongest 2-year profile — reached by *evolving a
shipped project*, not starting over.

**Target architecture:**
```
Next.js  →  Laravel                →  Python (FastAPI) AI service  →  Vector DB (pgvector/Qdrant)
            (auth, users, uploads,     (embed, chunk, retrieve,        + Gemini / Claude / OpenAI
             billing, queues, DB —      rerank, evaluate, orchestrate)
             the gateway)
```

**What moves:** Laravel keeps auth (unchanged), workspaces, membership, uploads, queues, all
frontend HTTP — it becomes the *gateway*. FastAPI gains embedding + retrieval + generation +
eval logic. Laravel calls FastAPI server-to-server behind auth instead of calling the LLM directly.

**Steps:** (1) Python + FastAPI + an LLM SDK basics. (2) Stand up `POST /embed` and `POST /ask`.
(3) Port `EmbedDocumentJob` + `RagService`, optionally rebuilding retrieval with **LlamaIndex**
or orchestration with **LangGraph** (this satisfies the "learn the ecosystem tools" milestone).
(4) Laravel calls FastAPI via `Http`. (5) Deploy FastAPI alongside Laravel (separate container).

> ⚠️ **Sequencing matters. Do NOT start here.** Ship Stage 1 first so you always have a working
> demo. Python is an *evolution* of a live project, not a prerequisite.

---

## Backend changes (`Chattrix-Backend/`)

### New migrations
1. `create_documents_table` — `id`, `workspace_id`→workspaces (cascade), `uploader_id`→users,
   `filename`, `path`, `mime_type`, `status` (`pending`/`processing`/`ready`/`failed`),
   `chunk_count` (default 0), `timestamps`.
2. `create_document_chunks_table` — `id`, `document_id`→documents (cascade),
   `workspace_id`→workspaces (**denormalised for fast tenant-scoped filtering**), `chunk_index`,
   `content` (longText), `embedding` (pgvector `vector(768)` — matches
   `services.gemini.embed_dimensions`), and **metadata**: `page` (nullable int), `token_count`,
   `char_start`/`char_end`. Index `(workspace_id)`, plus an HNSW index on `embedding`.

### Models
- `Document` — `$fillable`, `belongsTo(Workspace)`, `belongsTo(User,'uploader_id')`, `hasMany(DocumentChunk)`.
- `DocumentChunk` — `$fillable`, `belongsTo(Document)`, `belongsTo(Workspace)`, cast `embedding`→`array`.
- `Workspace` — add `hasMany(Document)`.

### Actions (`app/Actions/Document/`)
- `UploadDocumentAction` — validate + store, create `Document` (`status: pending`), dispatch `EmbedDocumentJob`.
- `DeleteDocumentAction` — remove file + rows.

### Job (`app/Jobs/`)
- `EmbedDocumentJob` — parse → clean → chunk (carry page/offset metadata) → batch-embed →
  save `DocumentChunk` rows (with `workspace_id` + metadata) → set `status: ready`/`failed`.
  On failure, record the error so the UI can show it.

### Services
- `EmbeddingService` — wraps Gemini embedding calls (`embed(array $texts): array`), behind a
  provider-agnostic interface.
- `RagService` — `ask(Workspace $ws, string $q): array`:
  1. embed question,
  2. **filter chunks by `workspace_id` first**, rank by pgvector cosine distance (`<=>`), take top-K,
  3. build grounded prompt (contract below), call Gemini,
  4. return `{ answer, citations[], usage: { tokens, latency_ms } }`.
- `ChunkingService` — ~500-token overlapping chunks, preserving page/offset metadata.
- `RagEvalService` (Stage 2) — runs the golden dataset, emits metrics.

### Prompt contract (grounded generation)
The system prompt MUST instruct the model to:
- answer **only** from the retrieved context,
- **cite** the chunk/source for each claim,
- reply **"I don't know based on the provided documents"** when the answer isn't present,
- avoid speculation.

### Controllers / Requests / Resources
- `DocumentController` (`index`, `store`, `destroy` — `ApiResponser`, gated by `WorkspacePolicy`),
  `AskController` (`ask`; Stage 1 JSON, later SSE streaming).
- `UploadDocumentRequest` (pdf/txt/md, max size), `AskQuestionRequest` (required question).
- `DocumentResource`, `AskAnswerResource` (answer + citations + usage).

### Policy — REUSE `WorkspacePolicy` ✅ (abilities added)
`viewDocuments`, `uploadDocument`, `deleteDocument`, `ask` — all resolve to
`Workspace::hasMember()`, since every workspace is private and membership is the whole access
rule. **This is the enforcement point for tenant isolation**, paired with the `workspace_id`
filter in the retrieval query; neither layer may assume the other ran.

### Routes (under `auth:sanctum`)
```
GET    /api/workspaces/{workspace}/documents
POST   /api/workspaces/{workspace}/documents
DELETE /api/workspaces/{workspace}/documents/{document}
POST   /api/workspaces/{workspace}/ask
```

### Config / composer
- `composer require smalot/pdfparser`
- `.env`: `GEMINI_API_KEY`, `GEMINI_CHAT_MODEL=gemini-2.0-flash`, `GEMINI_EMBED_MODEL=text-embedding-004`.
- `config/services.php`: `gemini` entry (`key`, `chat_model`, `embed_model`).
- Queue worker running (`php artisan queue:work`).

---

## Frontend changes (`chattrix-frontend/`)

Currently auth + dummy dashboard. Build workspace + RAG UI fresh:

### BFF proxy routes (`app/api/**`) — mirror existing auth handlers, forward cookies to Laravel
- `workspaces/route.ts` (+ `[slug]/`, `[slug]/members/`) — no `me/`, since `GET /api/workspaces`
  is already scoped to the caller.
- `workspaces/[slug]/documents/route.ts` (+ `[id]/route.ts` DELETE).
- `workspaces/[slug]/ask/route.ts` (POST; support streaming later).

### Pages / components
- `workspaces/page.tsx` — list + create.
- `workspace/[slug]/page.tsx`:
  - `DocumentsPanel` — upload + list with status (pending/processing/ready/failed + error).
  - `AskPanel` — question → answer with **citation chips** that reveal the source chunk;
    **stream tokens** (Stage 2) for a real product feel.
- Redux `workspacesSlice` (mirror `userSlice`). Restore sidebar "My Workspaces".

---

## Keep untouched / already removed / out of scope

- **Keep:** all auth (`AuthController`, `AuthService`, `TokenService`, `SanctumRefresh`,
  `refresh_token` table), `proxy.ts` + `app/api/auth/**`, `ApiResponser`, `UserRole`,
  workspaces CRUD + membership, profile.
- **Removed:** `Post`/`Comment` + tables, `chattrix-nest/`, hub UI + `/api/hubs` routes.
- **Out of MVP scope:** voting/scoring, nested comments/threads.

---

## Milestones (ship-gates)

- **M1 — "It embeds":** migrations + models + `UploadDocumentAction` + `EmbedDocumentJob`.
  Verify chunks + embeddings + metadata land in Postgres.
- **M2 — "It answers":** `RagService` + `AskController` + Ask panel. Grounded, cited answer,
  with "I don't know" behavior. **← demoable core.**
- **M3 — "It's isolated" (differentiator gate):** an automated **feature test** proving Acme
  cannot retrieve Globex's chunks (upload policy docs to both companies, ask cross-tenant, assert
  no leak + "I don't know" response). Ship this as a named test — it's the core talking point.
- **M4 — Deploy + README:** live URL, demo credentials for **both seeded companies** (Acme +
  Globex), architecture write-up (auth ⟂ RAG isolation), ingestion diagram. Demo script shows the
  same question returning each company's *own* policy. **← Stage 1 complete; resume-ready.**
- **M5 — hybrid + rerank + evals + observability (Stage 2):** measured quality delta,
  cost/latency logging. **← the "measured quality" resume story.**
- **M6 — Python/FastAPI AI service (Stage 3):** extract embed + retrieve + generate into FastAPI
  (LlamaIndex/LangGraph optional). Completes the Next.js + Laravel + Python profile.

---

## Resume payoff — the STAR stories this produces

- **Isolation:** *"Built workspace-scoped retrieval with a regression test proving zero
  cross-tenant leakage, enforced in the query layer and via policy."*
- **Quality:** *"Added hybrid search + cross-encoder reranking; measured recall@5 and faithfulness
  on a golden dataset and improved retrieval quality by X%."*
- **Cost/reliability:** *"Instrumented per-query token cost and latency across the embed→search→
  rerank→generate stages."*
- **Evolution:** *"Shipped RAG in Laravel, then extracted the AI layer into a FastAPI microservice
  the Laravel gateway calls — Next.js + Laravel + Python + vector DB, one evolving product."*

Resume line: **Next.js · Laravel · Python/FastAPI · PostgreSQL/pgvector · RAG (hybrid retrieval,
reranking, LLM-as-judge eval) · multi-tenant auth · queues · Docker.**

---

## Decisions (locked)
- **Provider:** Gemini free tier only, provider-agnostic interface. No mixing.
- **Naming:** full rename to `workspaces` — done.
- **Storage:** dedicated `documents` + `document_chunks` tables; chunks carry `workspace_id` + metadata.
- **Isolation:** enforced in the retrieval query AND `WorkspacePolicy`; proven by an M3 test.
- **Private-only tenancy.** `privacy_type` is dropped — a publicly readable workspace is one where
  isolation is switched off, which contradicts the headline claim and would put an unproven branch
  inside the policy that guards retrieval. Access rule: *you can see a workspace iff you have a
  `workspace_user` row.*
- **Invite-only membership.** Hashed, expiring, single-use invite tokens, mirroring the existing
  `refresh_token` discipline (hash at rest, `expires_at`, `revoked_at`) so invites extend the
  established security story rather than introducing an unrelated mechanism. The
  `workspace_invites` table is **M2 feature work, not yet built** — `JoinWorkspaceAction` is the
  membership primitive it will call.
- **Email-domain auto-join is deliberately NOT built.** An unverified `@acme.com` address is a
  self-asserted claim, and free providers would collapse every consumer signup into one workspace.
  It needs DNS TXT domain verification plus a public-suffix blocklist first. Worth *saying* in an
  interview ("here's why it can't ship yet"), not worth building now.
- **No platform-wide workspace listing.** `GET /api/workspaces` returns only the caller's own
  workspaces; a tenant-wide index would disclose which companies exist on the instance. The
  redundant `/workspaces/me` route was removed in favour of the scoped `index`.

### Roles & access (locked)
Two independent role axes — keep both, add nothing new for the MVP:
- **Platform:** `UserRole` = `SuperAdmin` | `User` (enum + `User::isSuperAdmin()` exist; deliberately
  wired to nothing — see the super-admin rule below).
- **Tenant:** `WorkspaceRole` = `Owner` | `Member`, stored on the `workspace_user.role` pivot column
  and written by `CreateWorkspaceAction` / `JoinWorkspaceAction`. The creator is enrolled as a pivot
  member as well as `workspaces.owner_id`, so the owner always satisfies a plain membership check.

> Full product + access-model reference, including the capability matrix: `docfordeep.html`.

Rules:
- **MVP (M1–M4) ships with NO super-admin feature.** The product runs entirely on workspace-scoped
  auth via `WorkspacePolicy`. Building super-admin now is scope creep that delays M2. Keep the enum +
  helper (free, already there) but wire nothing.
- **Super admin ≠ tenant data access.** If added after M4, super admin is scoped to *platform
  operations only* — list workspaces, cross-tenant usage/cost/latency dashboards (ties into Stage-2
  observability), disable abusive tenants, view eval metrics. It gets **no document or retrieval
  access**: the RAG query path filters on `workspace_id` with **no super-admin bypass**. Any
  break-glass access, if ever needed, goes through an explicit audited path — never a silent policy
  bypass. This boundary is a feature: the README states *"even platform admins cannot read tenant
  documents through the RAG path — isolation is in the query layer, not just the UI."*
- **Workspace roles stay Owner/Member for MVP.** A read-only **Viewer** role (can `ask`, cannot
  upload/delete) is the natural next addition but is deferred — not in M2 scope.
- Guest / public / anonymous access: out of scope.

## Environment status ✅ (ready to build)

- **pgvector 0.8.5 installed** (`brew install pgvector`) and `CREATE EXTENSION vector` run on both
  `chattrix` and `chattrix_testing`. Verified: `'[1,2,3]'::vector <=> '[1,2,4]'::vector` returns.
- **Tests moved off sqlite onto Postgres** (`phpunit.xml` → `pgsql` / `chattrix_testing`). sqlite
  cannot run pgvector, so the M3 isolation test would otherwise never exercise real vector search.
- **Gemini config wired** — `config/services.php` `gemini` entry (`key`, `base_url`, `chat_model`,
  `embed_model`, `embed_dimensions`) with `GEMINI_*` keys in `.env` and `.env.example`.
  `embed_dimensions` is declared in config because the `vector(n)` column width must match it —
  changing the embedding model is therefore also a migration.
- **Access model gaps closed** — see the Decisions block. `WorkspaceRole` now backed by a real pivot
  column; `privacy_type` gone from migration/model/resource/requests/policy; listing scoped to the
  caller.
- **Test harness** — `WorkspaceFactory` (`ownedBy()`, `withMembers()` states) plus
  `tests/Feature/Workspace/WorkspaceAccessTest.php`, 10 tests locking the access model down
  (non-member denial, owner-only mutation, no-leak listing, no self-serve join route, privacy
  setting cannot be reintroduced).

**Still to do before M1:** `composer require smalot/pdfparser`, and put a real key in
`GEMINI_API_KEY`.

## Open questions (answer before M1)
1. **Gemini key:** created the free key at aistudio.google.com yet? Config slot is wired and waiting.
2. **Eval dataset:** seed the golden set with ~15–20 policy questions per company (e.g. "How many
   casual leaves do I get?", "What's the WFH policy?", "Who approves expense reimbursements?",
   "What's the notice period?") with expected answers taken straight from the seeded handbooks —
   trivial to grade because you wrote the docs. Include a few **cross-tenant probes** (ask Acme's
   app a question only answerable from Globex's docs; expected answer = "I don't know") to double as
   isolation eval.
