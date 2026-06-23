# Chattrix

Chattrix is a full-stack community platform with a Laravel API backend and a Next.js frontend. Users create and join hubs (communities), post and comment within them, and authenticate through a token-based system with a Next.js BFF layer handling secure cookie storage. AI-assisted features such as summaries, moderation, semantic search, related posts, and post insights are planned; see [ROADMAP.md](ROADMAP.md).

The current codebase contains the core foundation: authentication, token refresh primitives, protected frontend routes, hub/community CRUD, database migrations for posts and comments, and a monorepo workspace for the Next.js application.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Implemented Features](#implemented-features)
- [Prerequisites](#prerequisites)
- [Environment](#environment)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Useful Commands](#useful-commands)
- [API Overview](#api-overview)
- [Auth Summary](#auth-summary)
- [Current Development Priorities](#current-development-priorities)
- [Security Notes](#security-notes)
- [Documentation](#documentation)
- [License](#license)

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
  - custom refresh-token table
  - policies and form requests
  - REST endpoints
  |
  v
Database
```

The frontend intentionally acts as a small BFF layer. Browser JavaScript does not receive raw access or refresh tokens. The Next.js route handlers talk to Laravel, then store tokens as HttpOnly cookies that only the server can read.

For the detailed auth design, see [docs/AUTH_BFF.md](docs/AUTH_BFF.md).

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit, React Redux |
| Backend | Laravel 13, PHP 8.3 |
| Auth | Laravel Sanctum access tokens + custom refresh tokens |
| Database | MySQL or any Laravel-supported SQL database |
| Package management | Yarn 4 workspace for frontend, Composer for backend |

## Repository Layout

```text
.
+-- Chattrix-Backend/       Laravel API
+-- chattrix-frontend/      Next.js frontend and BFF route handlers
+-- docs/                   Project documentation
+-- DESIGN.md               Product and UI direction
+-- ROADMAP.md              Learning and delivery roadmap
+-- package.json            Root Yarn workspace scripts
+-- yarn.lock
```

## Implemented Features

- User registration with validated name, email, password, and password confirmation.
- User login with Laravel Sanctum access-token issue.
- Custom refresh-token persistence using SHA-256 hashes.
- Logout that revokes the current access token and stored refresh tokens for the user.
- Next.js login/logout route handlers that keep tokens in HttpOnly cookies.
- Protected frontend routing through `chattrix-frontend/proxy.ts`.
- Hub/community CRUD API protected by Sanctum.
- Hub authorization through `HubPolicy`.
- Public/private hub visibility checks.
- Avatar upload support for hubs through Laravel public storage.
- Post and comment database tables scaffolded for upcoming work.

## Prerequisites

- PHP 8.3+
- Composer
- Node.js compatible with Next.js 16
- Yarn 4
- MySQL or another configured Laravel database
- Laravel Herd is supported by the current local examples, but not required

## Environment

### Backend

Create `Chattrix-Backend/.env` from Laravel's `.env.example` if it exists in your local checkout, then configure the usual Laravel values:

```env
APP_NAME=Chattrix
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=https://chattrix-backend.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chattrix
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_ACCESS_TOKEN_EXPIRATION_IN_MINUTES=60
REFRESH_TOKEN_EXPIRATION_DAYS=1
```

Generate the app key if needed:

```bash
cd Chattrix-Backend
php artisan key:generate
```

### Frontend

Create `chattrix-frontend/.env.local` from `chattrix-frontend/.env.local.example`:

```env
BACKEND_URL=https://chattrix-backend.test

# Development only when Node fetch does not trust Herd's local CA.
NODE_TLS_REJECT_UNAUTHORIZED=0
```

`BACKEND_URL` must point to the Laravel backend origin. The Next.js BFF route handlers append API paths such as `/api/auth/login`.

## Installation

Install backend dependencies:

```bash
cd Chattrix-Backend
composer install
php artisan migrate
```

Install frontend dependencies from the repo root:

```bash
yarn install
```

## Running Locally

Start the Laravel backend:

```bash
cd Chattrix-Backend
php artisan serve
```

Or use Herd and point `BACKEND_URL` at the Herd site URL.

Start the Next.js frontend from the repo root:

```bash
yarn dev
```

The frontend runs through the workspace script and opens on the Next.js dev server, usually `http://localhost:3000`.

## Useful Commands

From the repository root:

```bash
yarn dev      # Start the frontend dev server
yarn build    # Build the frontend
yarn start    # Start the built frontend
yarn lint     # Run frontend linting
```

From `Chattrix-Backend`:

```bash
php artisan migrate      # Run database migrations
php artisan test         # Run backend tests
php artisan route:list   # Inspect API routes
composer run test        # Clear config and run Laravel tests
```

## API Overview

### Auth

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a user |
| POST | `/api/auth/login` | Public | Issue access and refresh tokens |
| POST | `/api/auth/logout` | Bearer token when available | Revoke login state |
| GET | `/api/auth/me` | Sanctum | Return current user |
| POST | `/api/auth/refresh` | Refresh middleware | Issue a new access token |

### Hubs

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/hubs` | Sanctum | Paginated hub list |
| POST | `/api/hubs` | Sanctum | Create a hub |
| GET | `/api/hubs/{hub}` | Sanctum | Read one hub |
| PUT/PATCH | `/api/hubs/{hub}` | Sanctum | Update owned hub |
| DELETE | `/api/hubs/{hub}` | Sanctum | Delete owned hub |

## Auth Summary

Login is handled through `chattrix-frontend/app/api/auth/login/route.ts`. That route posts credentials to Laravel, receives the token payload, stores `access_token` and `refresh_token` as HttpOnly cookies, and returns only user-safe data to the browser.

Laravel stores access tokens through Sanctum's `personal_access_tokens` table. Refresh tokens are generated as random 64-character strings, hashed with SHA-256, and stored in the custom `refresh_token` table.

Important current implementation note: refresh-token validation exists, but refresh-token rotation and revoked-token checks still need to be completed before this flow is production-ready.

## Current Development Priorities

The roadmap in [ROADMAP.md](ROADMAP.md) is the source of truth for upcoming milestones. The next practical priorities are:

- [ ] Finish and test refresh-token rotation end to end.
- [ ] Add frontend route handlers for authenticated API calls beyond login/logout.
- [ ] Complete community join/leave behavior.
- [ ] Build post CRUD and voting.
- [ ] Add focused PHPUnit tests for auth, refresh, logout, and hub authorization.
- [ ] Add reproducible Docker Compose setup.

## Security Notes

- Keep tokens out of browser-accessible storage.
- Use HttpOnly, Secure, SameSite cookies in production.
- Store only refresh-token hashes in the database.
- Rotate refresh tokens instead of reusing the same refresh token forever.
- Revoke refresh-token families on suspected replay.
- Add rate limiting to login, register, refresh, and AI endpoints before production.
- Remove debug statements and token logging before deployment.

## Documentation

- [Auth, Refresh Tokens, and Next.js BFF](docs/AUTH_BFF.md)
- [Design Document](DESIGN.md)
- [Roadmap](ROADMAP.md)

## License

No license has been added yet. Add a `LICENSE` file (e.g. MIT, Apache 2.0) to clarify how others may use this code.