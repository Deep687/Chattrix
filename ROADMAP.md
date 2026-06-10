# Chattrix — Learning Roadmap

> **Goal:** Build a full-stack, AI-powered Reddit-like platform from scratch — and ship it to a real server.
> By the end, you will have covered full-stack development (Laravel + Next.js) and DevOps (Docker, CI/CD, deployment, monitoring) in one real project.

---

## The Core Loop

Every milestone follows the same pattern:

```
Build the feature  →  Write tests  →  Ship it  →  Verify it works in prod
```

DevOps is not a separate topic. It is what happens every time you ship.

---

## Where We Are Now

- [x] Project scaffolding (Laravel backend + Next.js frontend)
- [x] User registration, login, logout
- [x] Laravel Sanctum token auth + refresh tokens
- [x] Hub (Community) model + migrations
- [x] Post and Comment table migrations
- [ ] Everything else below

---

## Milestone 1 — Docker & Local Environment

**What you will learn:** Containerisation, Docker Compose, environment variables, how services talk to each other.

**Why now:** Before building more features, make the local environment reproducible. Anyone should be able to clone and run with one command.

### Tasks
- [ ] Write a `Dockerfile` for the Laravel backend (PHP-FPM + Nginx)
- [ ] Write a `Dockerfile` for the Next.js frontend
- [ ] Write a `docker-compose.yml` that wires: backend + frontend + MySQL + Redis
- [ ] Move all secrets to `.env` files, add `.env.example` for both apps
- [ ] Verify `docker compose up` boots the full stack

### Concepts Covered
- What a container is vs a virtual machine
- How Docker networking works (containers talking to each other by service name)
- Why `.env` files exist and why you never commit them
- What Docker Compose is and when you need it

---

## Milestone 2 — Communities (Core Dev)

**What you will learn:** RESTful API design, Eloquent relationships, Laravel policies, Next.js data fetching.

### Backend Tasks
- [ ] Communities CRUD API (`/api/communities`)
- [ ] Join / Leave community endpoints
- [ ] Community membership model + pivot table
- [ ] Authorization: only admins can delete a community
- [ ] Slug-based routing (`/r/community-name`)

### Frontend Tasks
- [ ] Communities list page (`/communities`)
- [ ] Single community page (`/r/[slug]`)
- [ ] Create community form
- [ ] Join / Leave button with optimistic UI update

### Concepts Covered
- Laravel Policies and Gates
- Eloquent `belongsToMany` relationships
- Next.js dynamic routes and `generateStaticParams`
- Optimistic UI updates in React

---

## Milestone 3 — Posts & Voting (Core Dev)

**What you will learn:** Complex queries, vote systems, feed algorithms, file uploads.

### Backend Tasks
- [ ] Posts CRUD API (text, link, image post types)
- [ ] Upvote / downvote endpoint (toggle logic)
- [ ] Vote score calculation
- [ ] Image upload (local disk for now, S3 later)
- [ ] Post feed sorted by hot / new / top

### Frontend Tasks
- [ ] Post card component (vote column + content)
- [ ] Submit post form (with post type selector)
- [ ] Home feed (`/`) with sort tabs
- [ ] Community feed (`/r/[slug]`)
- [ ] Vote button with instant score update

### Concepts Covered
- "Hot" ranking algorithm (score + time decay)
- File storage in Laravel (`Storage` facade)
- React controlled forms with validation
- Feed pagination (cursor-based vs offset)

---

## Milestone 4 — CI/CD Pipeline

**What you will learn:** GitHub Actions, automated testing, deployment pipelines.

**Why now:** You have real features to test. CI without tests is useless. Tests without CI are optional.

### Tasks
- [ ] Write PHPUnit tests for auth and community endpoints
- [ ] Write Jest tests for key frontend components
- [ ] Create `.github/workflows/ci.yml` — run tests on every push
- [ ] Create `.github/workflows/deploy.yml` — deploy to server on merge to `main`
- [ ] Add branch protection: PRs must pass CI before merge

### Concepts Covered
- What a CI/CD pipeline is and why it exists
- GitHub Actions: triggers, jobs, steps, secrets
- How to run a Laravel test suite in CI (with a test database)
- What "deployment pipeline" means vs manually SSHing into a server

---

## Milestone 5 — Comments & Nested Threads (Core Dev)

**What you will learn:** Recursive data structures, tree rendering in React, nested query performance.

### Backend Tasks
- [ ] Comments API (add, delete, vote)
- [ ] Nested replies (parent_id self-reference)
- [ ] Efficient tree loading (avoid N+1 queries)
- [ ] Comment karma contribution to user score

### Frontend Tasks
- [ ] Comment thread component (recursive render)
- [ ] Collapse / expand thread
- [ ] Reply form inline under each comment
- [ ] Vote on comments

### Concepts Covered
- Adjacency list vs nested set for tree data
- Recursive React components
- Laravel `with()` eager loading to prevent N+1
- `useRef` for auto-scroll to new comment

---

## Milestone 6 — Deploy to a Real Server

**What you will learn:** Linux server administration, Nginx, SSL certificates, process management.

**Why now:** You have a working app. Time to put it on the internet.

### Tasks
- [ ] Provision a VPS (DigitalOcean, Hetzner, or Vultr — ~$6/month)
- [ ] Set up Nginx as a reverse proxy for both apps
- [ ] Issue a free SSL certificate (Let's Encrypt / Certbot)
- [ ] Set up `systemd` service for the Laravel queue worker
- [ ] Configure MySQL on the server with a non-root user
- [ ] Run `php artisan migrate --force` as part of the deploy script
- [ ] Point a domain name to the server

### Concepts Covered
- How Nginx proxies traffic to your app
- What SSL/TLS is and how HTTPS works
- Linux users, file permissions, `systemd`
- What a queue worker is and why it needs to stay running
- DNS: A records, TTL, how a domain resolves

---

## Milestone 7 — User Profiles & Karma (Core Dev)

**What you will learn:** Aggregations, caching, user-generated content patterns.

### Backend Tasks
- [ ] Karma score calculation (post votes + comment votes)
- [ ] User profile API (`/api/users/{username}`)
- [ ] Post history, comment history endpoints
- [ ] Avatar upload + resize
- [ ] Cache karma score (avoid recalculating on every request)

### Frontend Tasks
- [ ] User profile page (`/u/[username]`)
- [ ] Post/comment history tabs
- [ ] Edit profile form (bio, avatar)
- [ ] Karma badge on posts and comments

### Concepts Covered
- Laravel Cache (Redis) — when and what to cache
- Image resizing with `intervention/image`
- Aggregate queries (`SUM`, `COUNT` with Eloquent)

---

## Milestone 8 — AI Features

**What you will learn:** LLM API integration, prompt engineering, async jobs, streaming responses.

### AI Summary
- [ ] Call Claude/OpenAI API on long post bodies
- [ ] Cache the summary (don't re-generate on every view)
- [ ] Display summary badge on post cards

### AI Moderation
- [ ] Run new posts through a moderation prompt before publishing
- [ ] Auto-hold flagged content for review
- [ ] Build a simple mod queue UI

### Smart Search
- [ ] Generate embeddings for posts on creation
- [ ] Store vectors (pgvector or Pinecone)
- [ ] Semantic search endpoint (`/api/search`)
- [ ] Replace basic search UI with semantic results

### Related Posts
- [ ] Find similar posts by vector similarity
- [ ] Display "Related" section at bottom of post page

### Concepts Covered
- How LLM APIs work (tokens, context window, cost)
- Prompt engineering basics
- Laravel queued jobs (async AI calls so the request doesn't wait)
- What vector embeddings are and how similarity search works

---

## Milestone 9 — Production Hardening

**What you will learn:** Observability, error tracking, zero-downtime deploys, rate limiting.

### Tasks
- [ ] Set up error tracking (Sentry — free tier)
- [ ] Set up uptime monitoring (UptimeRobot — free)
- [ ] Add rate limiting to auth and AI endpoints
- [ ] Implement zero-downtime deploys (blue-green or rolling)
- [ ] Add structured logging to Laravel (JSON logs)
- [ ] Review and fix N+1 queries with Laravel Debugbar
- [ ] Add database indexes on high-traffic columns

### Concepts Covered
- Why structured logs are better than `dd()`
- What rate limiting protects against
- How zero-downtime deploys work
- Database query planning and indexing

---

## Milestone 10 — Media Storage & CDN

**What you will learn:** Cloud storage, CDN, presigned URLs, cost management.

### Tasks
- [ ] Migrate image uploads from local disk to S3 (or Cloudflare R2)
- [ ] Serve media through a CDN
- [ ] Generate presigned URLs for direct browser → S3 uploads
- [ ] Store only the S3 key in the database, not the full URL

### Concepts Covered
- Why you don't store files on the application server in production
- How S3 presigned URLs work
- What a CDN does and when you need one
- Cost difference: serving from EC2 vs CloudFront vs R2

---

## Skills You Will Have By the End

### Development
- Laravel: Auth, Eloquent, Policies, Queues, Caching, File Storage, API design
- Next.js: Dynamic routing, SSR vs CSR, data fetching, optimistic UI
- TypeScript: Types, interfaces, generics in a real codebase
- Database: Relational modelling, migrations, indexing, N+1 prevention
- AI: LLM API integration, prompt design, embeddings, vector search

### DevOps
- Docker and Docker Compose
- GitHub Actions (CI/CD pipelines)
- Linux server administration (Nginx, systemd, SSH)
- SSL/TLS and HTTPS
- Cloud storage (S3/R2) and CDN
- Error tracking and uptime monitoring
- Zero-downtime deployment strategies

---

## Realistic Timeline

| Milestone | Est. Duration |
|---|---|
| 1 — Docker | 1 week |
| 2 — Communities | 2 weeks |
| 3 — Posts & Voting | 2 weeks |
| 4 — CI/CD | 1 week |
| 5 — Comments | 2 weeks |
| 6 — Deploy | 1 week |
| 7 — User Profiles | 1 week |
| 8 — AI Features | 3 weeks |
| 9 — Production Hardening | 1 week |
| 10 — Media & CDN | 1 week |
| **Total** | **~15 weeks (4 months)** |

This assumes consistent work of a few hours per week. Go faster if you can. The important thing is finishing, not the timeline.

---

## Ground Rules

1. **Never skip a milestone to get to the fun stuff.** Docker before CI. CI before deploy. Order matters.
2. **Always understand before copy-pasting.** If you paste something without knowing why it works, it will break in production and you won't know how to fix it.
3. **Ship after every milestone.** A feature that only runs on your laptop doesn't count.
4. **Break things in dev, not in prod.** That's what Docker and CI are for.
5. **Read the official docs.** Laravel docs, Next.js docs, Docker docs — they are excellent.
