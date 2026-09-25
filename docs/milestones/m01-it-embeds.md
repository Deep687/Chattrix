# M1 — It embeds

**Goal:** an uploaded policy doc becomes searchable chunks with embeddings and metadata in Postgres.

## Scope
- `documents` + `document_chunks` migrations (schema in `migration.plan.md` → Backend changes).
- `Document`, `DocumentChunk` models + factories; `Workspace::documents()`.
- `UploadDocumentAction`, `DeleteDocumentAction`.
- `EmbedDocumentJob`: parse → clean → chunk (~500 tokens, ~15% overlap, page/offset kept) →
  batch-embed → store → status `ready` | `failed` (+ error).
- `EmbeddingService` behind a provider interface; `ChunkingService`.
- `DocumentController` (index/store/destroy) + routes, gated by `WorkspacePolicy`.
- Frontend: `DocumentsPanel` — upload, list, live status.

## Out of scope
Asking questions, streaming, per-document permissions (M5).

## Acceptance criteria
- [ ] PDF, TXT, MD upload; other types and oversized files rejected.
- [ ] Status moves pending → processing → ready; failures show a readable error.
- [ ] Every chunk carries `workspace_id`, `document_id`, `chunk_index`, page, offsets, token count.
- [ ] Embedding width matches `services.gemini.embed_dimensions`.
- [ ] Deleting a document removes the file and its chunks.
- [ ] Non-members cannot list, upload, or delete.

## Tests
- Chunking: boundaries, overlap, empty doc, huge doc (unit).
- Job: happy path, provider failure → `failed`, retry is idempotent (no duplicate chunks).
- Access: non-member 403 on every document route.
- Provider faked — no live Gemini calls in tests.

## Before starting
- Confirm the Gemini embedding model is still served (see Decisions in `migration.plan.md`).
- `composer require smalot/pdfparser`.

## Unresolved questions
1. Store originals on local disk or S3-compatible from day one?
2. Max upload size?

## Notes
