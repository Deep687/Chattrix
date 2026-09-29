# Chattrix — UI/UX Design

How the product should look and behave. Product scope and access rules live elsewhere — this file
only covers the interface:

- `docfordeep.html` — product definition, roles, capability matrix
- `migration.plan.md` — build plan, milestones, backend design
- `Chattrix-Backend/routes/api.php` — the API, source of truth for endpoints

---

## 1. The product in one paragraph

Chattrix is an internal policy assistant. Each workspace is one company. Employees ask
plain-English questions and get answers grounded in their own company's HR / IT / compliance
documents, with citations to the exact passage. When the answer isn't in the docs, the app says
"I don't know based on the provided documents". Retrieval cannot cross workspaces.

## 2. Who uses it

| User | Job | Where they spend time |
|---|---|---|
| **Member** (employee) | Get a correct answer fast, and trust it | Ask screen |
| **Owner** (HR / IT admin) | Keep the document set complete and current; manage who's in | Documents, Members |

Members are the majority and visit rarely. Every session is cold-start: no onboarding, no
learning curve. Owners visit more often and tolerate denser screens.

## 3. UX principles

Ranked by priority. If two conflict, the higher one wins.

1. **Trust over delight.** A cited answer that looks plain beats a slick one without sources.
   Citations are always visible inline, never behind a "show sources" toggle.
2. **"I don't know" is a result, not an error.** Give it a neutral style, not red or a warning
   icon, and point to a next step (who to ask, which docs exist). Refusing to guess is the
   product working.
3. **Always show which workspace you're in.** Someone in two companies must never wonder whose
   policies answered them. The workspace name and avatar appear on every in-workspace screen,
   including next to the ask input.
4. **Be honest about processing.** A document is `pending → processing → ready | failed`. Show the
   real state, and show the error on `failed`. Don't show a document as askable before it's `ready`.
5. **Hide what the role can't do.** Members don't see disabled Owner controls (invite, delete
   workspace). A greyed-out button reads as "you could, but not now". A hidden one reads as
   "not your job". The server enforces access either way; the UI only reflects it.
6. **Quiet chrome, loud content.** Answers and document text carry the page. Navigation, borders
   and backgrounds stay low-contrast.

## 4. Screens

| Route | Screen | Status |
|---|---|---|
| `/login`, `/signup` | Auth | built |
| `/verify-email` | Verify-email prompt + resend | built |
| `/workspace/invitations/accept` | Invite preview → accept (works signed-out) | built |
| `/workspaces` | My workspaces + create | built |
| `/workspaces/[id]` | Workspace home — see layout below | built (shell); Ask + Documents in M1–M2 |
| `/profile`, `/profile/[id]` | Own / other profile | built |
| `/dashboard` | Redirect only: one workspace → that workspace, else `/workspaces` | built |

Planned, per milestone: answer-trace panel (M7), per-document audience controls (M5),
knowledge-gaps report for Owners (M11).

## 5. Layout

```
┌───────────────┬──────────────────────────────────────────────┐
│ Sidebar       │  [Acme ▾]   Ask · Documents · Members         │  ← workspace header + tabs
│               ├──────────────────────────────────────────────┤
│ My workspaces │                                              │
│  ● Acme       │   Conversation / answer column (max ~720px)  │
│  ○ Globex     │                                              │
│               │   Answer text with [1] [2] citation chips    │
│ + New         │   ┌ Source preview (on chip click) ────────┐ │
│               │   │ acme-hr-handbook.pdf · p.4              │ │
│               │   │ "…12 casual leaves per calendar year…"  │ │
│ ───────────── │   └────────────────────────────────────────┘ │
│ User menu     │   [ Ask Acme's policies…            ] [→]    │
└───────────────┴──────────────────────────────────────────────┘
```

- Mobile: the sidebar becomes a drawer (already built in `AppShell`), tabs scroll horizontally,
  and the source preview opens as a bottom sheet.
- The ask input's placeholder names the workspace ("Ask Acme's policies…"). This is principle 3.

## 6. Key components

| Component | Rules |
|---|---|
| **Answer** | Streamed text (M2). Citation chips `[n]` sit inline after the claim they support. Copy button. No avatar or "AI" persona. |
| **CitationChip** | Opens a preview with the filename, page, and quoted passage (the matching text highlighted). Keyboard-focusable. From M8 it also shows the effective date. |
| **NoAnswer state** | Neutral surface, not a danger colour. Text: "I don't know based on Acme's documents." Offers the list of indexed docs and, for Owners, "Add a document". |
| **DocumentRow** | Filename, uploader, uploaded date, status pill. `failed` shows the reason plus Retry / Delete. |
| **StatusPill** | `pending` / `processing` in muted text, `processing` with a subtle spinner. `ready` in success colour. `failed` in danger colour. |
| **WorkspaceAvatar** | Already built. Shown in the sidebar, workspace header, and invite preview. |
| **Empty states** | Every list has one, with a primary action. For example, no documents → Owner/Member: "Upload your first policy"; no workspaces → "Create a workspace or ask your admin for an invite". |

## 7. Visual system

**Editorial / paper.** A policy assistant should read like a well-set policy document. The look
uses serif headlines, warm paper, typographic rules, numbered sections, and citations set as
footnotes. It deliberately doesn't borrow Nexus AI's look: no glows, grids, gradients or
spotlights. Source of truth: `chattrix-frontend/app/globals.css`.

### Rules

- Components name a **role**, never a colour or a mode: `bg-surface`, `text-muted`,
  `border-hairline`. No `dark:` twins, no raw Tailwind palette classes.
- `accent` is graphic only. Accent-coloured text uses `accent-ink`.
- `hairline` is decoration and never carries meaning. A control's edge uses `control` (≥ 3:1).
- Red means danger only. No palette is red.
- Status reads by word: stamps (`Badge`) and margin-note labels (`Alert`: NOTE / DONE / ERROR).

### Type

| Role | Face | Where |
|---|---|---|
| Display | **Newsreader** (serif, italic for emphasis) | page and section titles, answer text, empty states, footnotes |
| UI | **Geist** | body copy, controls, forms |
| Labels | **Geist Mono**, small caps via `.eyebrow` | section numbers ("01 · ASK"), stamps, metadata |

### Tokens

| Role | Classes |
|---|---|
| Paper | `bg-canvas` (desk, with a static grain), `bg-surface` (sheet), `bg-surface-muted` (wells, ruled covers) |
| Ink | `text-ink`, `text-muted` |
| Edges | `border-hairline`, `border-control`, `.rule-double` (the double rule that opens a card) |
| Brand / accent | `bg-brand` + `text-on-brand`, `hover:bg-brand-strong`, `text-brand-ink`, `accent` / `accent-ink` |
| States | `danger` / `danger-ink` / `on-danger`, `success-ink`, `ring` |
| Shape | `rounded-control` (5px), `rounded-card` (7px): crisp and printed. `shadow-card`, `shadow-sheet` (a second sheet peeking out), `shadow-pop` |

### Palettes

Neutrals are warm paper in both modes, and the palettes only change brand, accent and ring.

| Palette | Brand (light / dark) | Accent | On-brand contrast (light / dark) |
|---|---|---|---|
| **Indigo & Coral** (default) | `#4F46E5` / `#8B93FF` | coral | 6.3 / 7.2 |
| **Azure & Amber** | `#0B62C4` / `#4EA3FF` | amber | 5.9 / 7.2 |
| **Violet & Rose** | `#6D28D9` / `#A78BFA` | rose | 7.1 / 7.0 |
| **Slate & Cyan** | `#1E293B` / `#E2E8F0` | cyan | 14.6 / 15.2 |

Every pair a viewer reads passes AA in all 8 combinations: brand-ink and accent-ink on surface
≥ 5.4, muted ≥ 6.1, control ≥ 3.8, fill vs surface ≥ 3. No palette is red, because red is danger.

### Editorial devices (`globals.css` components layer)

`.eyebrow` (mono small caps), `.rule-double`, `.ink-link` (underline draws in on hover),
`.leader` (dotted table-of-contents leader), `.ruled` (notebook ruling with an accent margin
line: covers and empty states), `.footnote` (citation marker). The logo is the serif wordmark
with a footnote "1".

### Components (`components/ui/`)

`SectionHeader` (number · eyebrow, serif title, lead, action, rule), `Card` (`ruled`, `stacked`),
`Banner` (ruled cover with a serif initial), `Badge` (stamp), `Button` / `ButtonLink` /
`linkClass`, `TextField` (serif italic placeholder), `Alert` (margin note), `Dialog` (a paper
sheet), `EmptyState`, `Icon`, `UserAvatar` / `WorkspaceAvatar` (serif monograms), `Reveal`,
`SegmentedChoice`. Shell: `Navbar` (masthead), `Sidebar` (the table of contents), `Footer`
(colophon), `AuthCard`, `AppearanceMenu`.

**Appearance lives in one place only:** the header's Appearance menu, holding the theme plus a
named palette list. It isn't repeated on the profile page.

### Motion: it prints, it doesn't float

Content is revealed by a clip sweeping down like ink on a page (`animate-ink`), never by fading
text, since partial opacity fails contrast. Everything is `motion-safe:`.

| Where | Effect |
|---|---|
| Route change, section heads, alerts | `animate-ink-fast` |
| Auth card, dialogs, menus | `animate-sheet`: a sheet laid down from a slight tilt |
| Sections on scroll | `<Reveal>` clip reveal; `.rule-line` rules draw left to right |
| Links | underline draws in (`.ink-link`) |
| Ask composer | blinking caret (`animate-caret`) |
| Theme / palette switch | view-transition page wipe, left to right |

## 8. Open items

1. The Ask and Documents panels on `/workspaces/[id]` are still placeholders. Build them to §5–6
   in M1–M2.
2. Tabs (Ask · Documents · Members) from §5 aren't built yet. The page is still one column plus
   a members rail.
3. 4 `<img>` lint warnings (avatars). Move them to `next/image` once the backend asset host is in
   `next.config.ts`.
