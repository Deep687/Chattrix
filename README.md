# Chattrix

Chattrix is a full-stack **workspace knowledge base** — a private "chat with your documents" app. Teams create a **workspace**, upload documents to it, and ask questions in plain English that are answered using *only that workspace's* documents, with citations. It is built on a Laravel API backend and a Next.js frontend, with a token-based auth system and a Next.js BFF layer for secure cookie storage.

The AI answering layer uses **retrieval-augmented generation (RAG)**. The project is being built in stages — see [`plan.html`](plan.html) for the beginner-friendly overview and [`migration.plan.md`](migration.plan.md) for the implementation plan.

> **Name:** "Chattrix" = *chat with your knowledge base*. The app was previously a Reddit-style community platform; its auth, workspace, and membership foundations were kept and repurposed for the knowledge-base direction.

## Current status

Working today:

- **Authentication** — register, login, logout, `me`, and refresh-token **rotation** (SHA-256 hashed refresh tokens, custom `SanctumRefresh` middleware).
- **BFF layer** — Next.js route handlers store tokens in HttpOnly cookies; route protection via `proxy.ts`.
- **Workspaces backend** — full CRUD + membership (owner/member, public/private), authorized by `WorkspacePolicy`. Renamed from the original "hubs" module.
- **Dummy dashboard** — a clean placeholder landing page after login.

Planned (not built yet) — the RAG layer, tracked in [`migration.plan.md`](migration.plan.md):

- Document upload → chunking → embeddings (M1)
- Ask-your-documents with grounded, cited answers (M2)
- Deploy + README architecture write-up (M3)
- pgvector + retrieval evals (M4)
- Extract the AI layer into a Python/FastAPI service (M5)

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment](#environment)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Auth Summary](#auth-summary)
- [Security Notes](#security-notes)
- [Documentation](#documentation)

## Architecture

```text
Browser
  |
  | HTTPS, form submissions, app navigation
  v
Next.js frontend / BFF
  - App Router pages
  - Route handlers under /app/api/*
  - HttpOnly auth cookies
  - route protection in proxy.ts
  |
  | Server-side fetch with Bearer token
  v
Laravel API
  - Sanctum access tokens
  - custom refresh-token table (rotation)
  - policies and form requests
  - REST endpoints (auth, workspaces)
  |
  v
Database (PostgreSQL — pgvector-ready for RAG)
```

The frontend intentionally acts as a small BFF layer. Browser JavaScript never receives raw access or refresh tokens — the Next.js route handlers talk to Laravel, then store tokens as HttpOnly cookies only the server can read.

The planned RAG layer adds two outbound calls from Laravel — embeddings and generation — via **Google Gemini** (free tier), kept provider-agnostic so a different LLM can be swapped in later. For the detailed auth design, see [docs/AUTH_BFF.md](docs/AUTH_BFF.md).

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit, React Redux |
| Backend | Laravel 13, PHP 8.3+ |
| Auth | Laravel Sanctum access tokens + custom refresh tokens (rotation) |
| Database | PostgreSQL (pgvector-ready for the RAG stage) |
| AI (planned) | Google Gemini free tier — `gemini-2.0-flash` (generation) + `text-embedding-004` (embeddings) |
| Package management | Yarn 4 workspace for frontend, Composer for backend |

## Repository Layout

```text
.
+-- Chattrix-Backend/       Laravel API (auth + workspaces)
+-- chattrix-frontend/      Next.js frontend and BFF route handlers
+-- docs/                   Project documentation
+-- plan.html               RAG project plan + learning guide (open in a browser)
+-- migration.plan.md       File-by-file plan for building the RAG feature
+-- DESIGN.md               Product and UI direction
+-- ROADMAP.md              Learning and delivery roadmap
+-- package.json            Root Yarn workspace scripts
+-- yarn.lock
```

## Prerequisites

- PHP 8.3+
- Composer
- Node.js compatible with Next.js 16
- Yarn 4
- PostgreSQL 17 (e.g. `brew install postgresql@17 && brew services start postgresql@17`, then `createdb chattrix`)
- Laravel Herd is supported by the current local examples, but not required

## Environment

### Backend

Configure `Chattrix-Backend/.env` with the usual Laravel values:

```env
APP_NAME=Chattrix
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=https://chattrix-backend.test

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=chattrix
DB_USERNAME=your_mac_user
DB_PASSWORD=

SANCTUM_ACCESS_TOKEN_EXPIRATION_IN_MINUTES=60
REFRESH_TOKEN_EXPIRATION_DAYS=1

# Planned — for the upcoming RAG feature (free key from https://aistudio.google.com)
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_EMBED_MODEL=text-embedding-004
```

Generate the app key if needed:

```bash
cd Chattrix-Backend
php artisan key:generate
```

### Frontend

Create `chattrix-frontend/.env.local`:

```env
BACKEND_URL=https://chattrix-backend.test

# Set to 0 only in local development when Node fetch does not trust Herd's local CA.
# Never set this in staging or production — it disables TLS verification entirely.
NODE_TLS_REJECT_UNAUTHORIZED=0
```

`BACKEND_URL` must point to the Laravel backend origin. The Next.js BFF route handlers append API paths such as `/api/auth/login`.

## Installation

Install backend dependencies and set up the database:

```bash
cd Chattrix-Backend
composer install
php artisan migrate       # or: php artisan migrate:fresh
```

Install frontend dependencies from the repo root:

```bash
yarn install
```

## Running Locally

Start the Laravel backend (or use Herd and point `BACKEND_URL` at the Herd site URL):

```bash
cd Chattrix-Backend
php artisan serve
```

Start the Next.js frontend from the repo root:

```bash
yarn dev
```

The frontend runs on `http://localhost:3000`.

## API Overview

### Auth

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a user |
| POST | `/api/auth/login` | Public | Issue access and refresh tokens |
| POST | `/api/auth/logout` | Bearer token | Revoke login state |
| GET | `/api/auth/me` | Sanctum | Return current user |
| PUT | `/api/auth/me` | Sanctum | Update current user |
| POST | `/api/auth/refresh` | Refresh middleware | Rotate and issue a new access token |

### Workspaces

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/workspaces` | Sanctum | Paginated workspace list |
| POST | `/api/workspaces` | Sanctum | Create a workspace |
| GET | `/api/workspaces/me` | Sanctum | Current user's owned + joined workspaces |
| GET | `/api/workspaces/{workspace}` | Sanctum | Read one workspace |
| PUT/PATCH | `/api/workspaces/{workspace}` | Sanctum | Update owned workspace |
| DELETE | `/api/workspaces/{workspace}` | Sanctum | Delete owned workspace |
| POST | `/api/workspaces/{workspace}/join` | Sanctum | Join a public workspace |
| GET | `/api/workspaces/{workspace}/members` | Sanctum | List workspace members |

### Documents & Ask (planned — see `migration.plan.md`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/workspaces/{workspace}/documents` | Upload a document (parsed + embedded) |
| GET | `/api/workspaces/{workspace}/documents` | List a workspace's documents |
| POST | `/api/workspaces/{workspace}/ask` | Ask a question, get a grounded, cited answer |

## Auth Summary

Login is handled through `chattrix-frontend/app/api/auth/login/route.ts`. That route posts credentials to Laravel, receives the token payload, stores `access_token` and `refresh_token` as HttpOnly cookies, and returns only user-safe data to the browser.

Laravel stores access tokens through Sanctum's `personal_access_tokens` table. Refresh tokens are generated as random 64-character strings, hashed with SHA-256, and stored in the custom `refresh_token` table. On refresh, the old token is invalidated and a new pair is issued (rotation), handled by the `SanctumRefresh` middleware.

## Current Development Priorities

The RAG build is tracked in [`migration.plan.md`](migration.plan.md). Immediate next steps:

- [ ] **M1** — document upload → chunking → Gemini embeddings, stored in MySQL.
- [ ] **M2** — `RagService` + ask endpoint returning grounded, cited answers.
- [ ] **M3** — deploy with demo credentials + architecture write-up.
- [ ] Add focused PHPUnit tests for auth, refresh, logout, and workspace authorization.

## Security Notes

- Keep tokens out of browser-accessible storage.
- Use HttpOnly, Secure, SameSite cookies in production.
- Store only refresh-token hashes in the database.
- Rotate refresh tokens instead of reusing the same one forever.
- Add rate limiting to login, register, refresh, and (upcoming) AI endpoints before production.
- Scope document retrieval to the requesting user's workspace — never leak one workspace's data into another.
- Remove debug statements and token logging before deployment.

## Documentation

- [RAG Project Plan & Learning Guide](plan.html)
- [Migration Plan (Chattrix → RAG)](migration.plan.md)
- [Auth, Refresh Tokens, and Next.js BFF](docs/AUTH_BFF.md)
- [Design Document](DESIGN.md)
- [Roadmap](ROADMAP.md)

## License

Unlicensed — all rights reserved until a `LICENSE` file is added.
