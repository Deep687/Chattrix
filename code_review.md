# Code Review — historical

> **Status: closed. Do not act on this file.**
> Every finding below was either fixed or found to be incorrect. Verified against the code on
> **2026-09-22**. Kept as a record of what was found and what was done about it; the findings are
> preserved verbatim under each heading, with the outcome added.
>
> **Finding 1 was wrong when it was written** — following it would have *disabled* route
> protection. See the note under that heading before trusting anything else here.

| # | Finding | Status |
| --- | --- | --- |
| 1 | `proxy.ts` never runs | ❌ Invalid — `proxy.ts` is correct for Next.js 16 |
| 2 | `refresh()` response key mismatch | ✅ Fixed |
| 3 | `auth:sanctum-refresh` guard accepts any access token | ✅ Fixed |
| 4 | Proxy AND condition lets users through with a stale refresh token | ✅ Fixed |
| 5 | `refresh_token` cookie not deleted on early-return logout | ✅ Fixed |
| 6 | `refresh_token` cookie not deleted on network-error logout | ✅ Fixed |
| 7 | `createRefreshToken()` hardcodes 1-day expiry | ✅ Fixed |
| 8 | `refresh()` never rotates the refresh token | ✅ Fixed |

---

## 1. proxy.ts never runs — all protected routes are unprotected — ❌ INVALID

> Original finding, `chattrix-frontend/proxy.ts`:
>
> Next.js only treats a file named `middleware.ts` at the project root as middleware. `proxy.ts` is
> never auto-invoked, so the dashboard and every other protected route are completely open to
> unauthenticated requests.
> **Fix:** rename `proxy.ts` → `middleware.ts` and rename the exported function to `middleware`.

**This was never true for this project.** Next.js 16 renamed the file convention: `proxy.ts`
exporting `proxy()` *is* the supported form, and `middleware.ts` is the pre-16 name. Confirmed in
`node_modules/next/dist/lib/constants.js` (`PROXY_FILENAME = 'proxy'`) and in the bundled docs at
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

The review was written against pre-16 knowledge. Applying its fix would have left the app with a
`middleware.ts` that Next 16 ignores — the exact vulnerability the finding claimed to describe.

## 2. refresh() response key mismatch — ✅ FIXED

> Original finding, `AuthController.php:134`:
>
> `login()` returns the token under `data.access_token.access_token`. `refresh()` returns it under
> `data.token.access_token`. Any frontend refresh call will dereference the wrong path, store
> `undefined`, and break every subsequent authenticated request.
> **Fix:** rename `'token'` → `'access_token'` in the refresh response to match login.

`refresh()` now spreads the same `$tokens` array that `login()` returns, so the two responses cannot
drift apart again.

## 3. auth:sanctum-refresh guard accepts any valid access token — ✅ FIXED

> Original finding, `routes/api.php:39`:
>
> The guard is registered with `driver: 'sanctum'` pointing at the standard users provider —
> identical to the default sanctum guard. It never consults the `refresh_tokens` table. Any
> non-expired access token can call `POST /auth/refresh` indefinitely, bypassing the refresh-token
> design entirely.
> **Fix:** implement a custom guard driver (or middleware) that validates the bearer token against
> the `refresh_tokens` table.

Replaced with a dedicated `SanctumRefresh` middleware, registered in `bootstrap/app.php` and applied
in `routes/api.php`. It validates the presented refresh token against the table.

## 4. Proxy AND condition lets users through with a stale refresh_token — ✅ FIXED

> Original finding, `proxy.ts:7`:
>
> `!access_token && !refresh_token` only redirects when both cookies are absent. If `access_token`
> is missing but `refresh_token` exists, the user passes the guard with no valid session.
> **Fix:** change to `!access_token`.

`proxy.ts` now returns early on a valid `access_token`, redirects to `/login` when no
`refresh_token` exists, and otherwise attempts a refresh before deciding.

## 5. refresh_token cookie not deleted on early-return logout path — ✅ FIXED

> Original finding, `logout/route.ts:9–16`:
>
> When `access_token` is missing, the function returns early deleting only `access_token`. The
> `refresh_token` cookie persists in the browser, keeping the user apparently "logged in" through
> the proxy guard (see #4).
> **Fix:** add `cookieStore.delete('refresh_token')` before the early return.

Both cookies are now deleted on the early-return path.

## 6. refresh_token cookie not deleted on network-error logout path — ✅ FIXED

> Original finding, `logout/route.ts:31–39`:
>
> Same issue in the catch block — only `access_token` is deleted on a backend fetch failure.
> **Fix:** add `cookieStore.delete('refresh_token')` in the catch block.

Both cookies are now deleted in the catch block.

## 7. createRefreshToken() hardcodes 1-day expiry, ignores config — ✅ FIXED

> Original finding, `AuthController.php:153`:
>
> `login()` reads `config('auth_tokens.refresh_token_expiration_days')` and uses it in the response
> `expires_in`, but `createRefreshToken()` always writes `now()->addDay()`. If
> `REFRESH_TOKEN_EXPIRATION_DAYS` is set to anything other than 1, the DB row expires before the
> browser cookie.
> **Fix:** pass the expiry into `createRefreshToken()`.

Token creation moved out of the controller into `TokenService`, which reads
`config('auth_tokens.refresh_token_expiration_in_minutes')` in its constructor and applies it in
`createRefreshToken()`. Note the config key and env var are now expressed **in minutes**
(`REFRESH_TOKEN_EXPIRATION_IN_MINUTES`), not days.

## 8. refresh() never rotates the refresh token — ✅ FIXED

> Original finding, `AuthController.php:118–142`:
>
> The refresh endpoint issues a new access token but leaves the old `RefreshToken` row untouched.
> The same refresh token can be reused indefinitely until its expiry — there is no single-use
> guarantee. A stolen refresh token is permanently valid.
> **Fix:** delete the old row and insert a new one with each refresh call.

`refresh()` calls `AuthService::invalidateTokensAfterRefresh()` and issues a new pair. The original
login time is carried forward in `session_started_at`, so rotation cannot extend a session past the
absolute lifetime in `config/auth_tokens.php`.
