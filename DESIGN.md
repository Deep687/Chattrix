# Chattrix — Design Document

## 1. What is Chattrix?

A Reddit-like community platform enhanced with AI features.
Users create communities, post content, vote, and discuss — with AI layered on top for summarisation, moderation, and discovery.

---

## 2. Core Features

### Communities
- Create / join communities (like subreddits)
- Community avatar, banner, description, rules
- Public / private / restricted visibility

### Posts
- Text post, link post, image/video post
- Upvote / downvote
- Save, share, report
- Flair / tags

### Comments
- Nested threaded replies
- Upvote / downvote on comments
- Collapse threads

### User
- Profile: avatar, bio, karma score
- Post & comment history
- Saved posts

### AI Features
- **AI Summary** — one-line TL;DR on long posts/threads
- **AI Moderation** — flag toxic/spam content before it goes live
- **Smart Search** — semantic search across posts and communities
- **Post Insights** — sentiment, read-time estimate, trending score
- **Related Posts** — AI-recommended posts at the bottom of each post

---

## 3. Pages / Routes

| Route | Page |
|---|---|
| `/` | Landing / home feed (trending posts) |
| `/login` | Login |
| `/register` | Register |
| `/r/[community]` | Community feed |
| `/r/[community]/submit` | Submit post to community |
| `/r/[community]/post/[id]` | Post detail + comments |
| `/u/[username]` | User profile |
| `/search` | Search results |
| `/communities` | Browse all communities |
| `/settings` | Account settings |

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| HTTP | Axios |
| Backend | Laravel (PHP) |
| Auth | Laravel Sanctum (token-based) |
| AI | TBD (OpenAI / Anthropic API) |
| DB | MySQL |
| Media storage | TBD (S3 / Cloudinary) |

---

## 5. Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#0f0f1a` | Page background |
| Surface | `#16161f` | Cards, sidebar |
| Surface raised | `#1c1c2e` | Modals, dropdowns |
| Border | `#ffffff12` | Dividers |
| Primary | `#6366f1` (indigo-500) | Buttons, links, accents |
| Primary hover | `#4f46e5` | |
| Text primary | `#f1f1f5` | Headings, body |
| Text muted | `#9999aa` | Subtitles, timestamps |
| Upvote | `#f97316` (orange-500) | Upvote icon active |
| Downvote | `#818cf8` (indigo-400) | Downvote icon active |
| AI accent | `#a78bfa` (violet-400) | AI badges, insights |
| Danger | `#ef4444` | Errors, delete |

### Typography
- Font: System sans-serif (Geist or Inter)
- Heading scale: `text-3xl` → `text-lg`
- Body: `text-sm` / `text-base`
- Muted: `text-muted` color + `text-sm`

### Spacing
- Page max-width: `max-w-6xl` centered
- Layout: 2-column (feed + sidebar) on desktop, single column on mobile
- Card padding: `p-4` / `p-6`
- Border radius: `rounded-xl` for cards, `rounded-lg` for buttons

### Component Patterns
- **Post card** — upvote column | thumbnail | title + meta + actions
- **Vote button** — icon + count, orange when upvoted, indigo when downvoted
- **AI badge** — `✦ AI` pill in violet with small label
- **Community pill** — `r/name` with community avatar (16px)
- **User chip** — `u/name` with avatar (16px)

---

## 6. Layout Skeleton

```
┌─────────────────────────────────────────────────┐
│  Navbar: Logo | Search | Login / User menu       │
├─────────────────────┬───────────────────────────┤
│                     │                           │
│   Feed / Content    │   Sidebar                 │
│   (max ~680px)      │   - Community info        │
│                     │   - Rules                 │
│                     │   - Create post CTA       │
│                     │   - Related communities   │
└─────────────────────┴───────────────────────────┘
```

---

## 7. API Endpoints (planned)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register ✅ |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Current user |

### Communities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/communities` | List all |
| POST | `/api/communities` | Create |
| GET | `/api/communities/{slug}` | Get one |
| POST | `/api/communities/{slug}/join` | Join |
| POST | `/api/communities/{slug}/leave` | Leave |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Home feed |
| GET | `/api/communities/{slug}/posts` | Community feed |
| POST | `/api/communities/{slug}/posts` | Create post |
| GET | `/api/posts/{id}` | Get post |
| DELETE | `/api/posts/{id}` | Delete post |
| POST | `/api/posts/{id}/vote` | Upvote/downvote |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts/{id}/comments` | List comments |
| POST | `/api/posts/{id}/comments` | Add comment |
| POST | `/api/comments/{id}/vote` | Vote on comment |
| DELETE | `/api/comments/{id}` | Delete comment |

### AI
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts/{id}/summary` | AI TL;DR |
| GET | `/api/posts/{id}/related` | Related posts |
| GET | `/api/search?q=` | Semantic search |

---

## 8. Build Order

1. **Auth** — register, login, logout, `/me` ✅ (partial)
2. **Communities** — CRUD + join/leave
3. **Posts** — CRUD + voting
4. **Comments** — nested comments + voting
5. **Home feed** — sorted by hot/new/top
6. **AI: Summary** — call LLM on post body
7. **AI: Moderation** — pre-publish content check
8. **AI: Semantic search**
9. **AI: Related posts**
10. **User profiles & karma**
