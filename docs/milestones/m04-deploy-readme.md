# M4 — Deploy + README

**Goal:** a live URL anyone can try, and a README that sells the isolation story in two minutes.
**Resume-ready.**

## Scope
- Deploy backend (Laravel + queue worker + Postgres with pgvector) and frontend (Next.js).
- Seed Acme + Globex with demo accounts; demo credentials in the README.
- README: pitch, architecture diagram (auth ⟂ RAG isolation), ingestion diagram, test claims.
- Demo script + 2-minute video: same question → each company's own answer; injection attempt fails.

## Out of scope
Custom domain polish, billing, analytics.

## Acceptance criteria
- [ ] Live URL works end to end with both demo companies.
- [ ] Demo accounts cannot upload abusive volumes (quota / read-only demo mode).
- [ ] CI badge green; M3 test names listed in the README.
- [ ] Video linked at the top of the README.
- [ ] No secrets in the repo or client bundle.

## Tests
- Smoke test against the deployed URL (login, ask, cited answer).

## Unresolved questions
1. Hosting target (Laravel Cloud, Fly, Railway, VPS)?
2. Demo mode: read-only seeded docs, or allow uploads with a quota and nightly reset?

## Notes
