# Auth, Refresh Tokens, and the Next.js BFF Layer

This document explains the intended authentication architecture for Chattrix: Laravel owns identity and token validation, while Next.js acts as a thin BFF that protects tokens from browser JavaScript and gives the frontend a clean session-like interface.

## Goals

- Keep access and refresh tokens out of `localStorage`, `sessionStorage`, and client-readable JavaScript.
- Use short-lived access tokens for normal API authorization.
- Use longer-lived refresh tokens to renew access without forcing frequent logins.
- Store only refresh-token hashes in the database.
- Centralize browser-facing auth behavior in Next.js route handlers.
- Keep Laravel as the source of truth for users, authorization, token issue, token refresh, and token revocation.

## Current Components

| Layer | File | Responsibility |
| --- | --- | --- |
| Next.js login BFF | `chattrix-frontend/app/api/auth/login/route.ts` | Sends credentials to Laravel and stores tokens in HttpOnly cookies |
| Next.js logout BFF | `chattrix-frontend/app/api/auth/logout/route.ts` | Calls Laravel logout and clears cookies |
| Next.js route protection | `chattrix-frontend/proxy.ts` | Redirects unauthenticated page requests to `/login` |
| Laravel auth controller | `Chattrix-Backend/app/Http/Controllers/AuthController.php` | Register, login, logout, refresh |
| Laravel refresh middleware | `Chattrix-Backend/app/Http/Middleware/SanctumRefresh.php` | Validates refresh token and sets current user |
| Refresh-token model | `Chattrix-Backend/app/Models/RefreshToken.php` | Maps hashed refresh tokens to users |
| Refresh-token table | `Chattrix-Backend/database/migrations/2026_06_01_114835_create_refresh_token_table.php` | Stores `token_hash`, `expires_at`, and `revoked_at` |
| Token config | `Chattrix-Backend/config/auth_tokens.php` and `Chattrix-Backend/config/sanctum.php` | Controls refresh and access-token lifetimes |

## Token Types

### Access Token

The access token is a Laravel Sanctum personal access token.

- Issued during login.
- Sent to Laravel as `Authorization: Bearer <token>`.
- Short-lived, controlled by `SANCTUM_ACCESS_TOKEN_EXPIRATION_IN_MINUTES`.
- Stored by Next.js in an HttpOnly `access_token` cookie.
- Used for normal protected API requests such as `/api/auth/me` and `/api/hubs`.

### Refresh Token

The refresh token is a custom random token.

- Issued during login.
- Stored in the browser only as an HttpOnly `refresh_token` cookie.
- Hashed with SHA-256 before being stored in Laravel's `refresh_token` table.
- Longer-lived than the access token, controlled by `REFRESH_TOKEN_EXPIRATION_DAYS`.
- Used only to obtain a new access token.

The raw refresh token should never be stored in the database, logged, returned after login except to the BFF, or exposed to client-side JavaScript.

## Login Flow

```text
Browser
  |
  | POST /api/auth/login
  | email + password
  v
Next.js route handler
  |
  | POST {BACKEND_URL}/api/auth/login
  v
Laravel AuthController@login
  |
  | validate credentials
  | create Sanctum access token
  | create random refresh token
  | store SHA-256 refresh-token hash
  v
Next.js route handler
  |
  | Set-Cookie: access_token=...; HttpOnly
  | Set-Cookie: refresh_token=...; HttpOnly
  v
Browser receives user payload only
```

The browser gets a success response with safe user data. It does not need to read or manually attach tokens.

## Cookie Strategy

Current cookie names:

- `access_token`
- `refresh_token`

Recommended production attributes:

```text
HttpOnly
Secure
SameSite=Lax or Strict depending on product needs
Path=/
Max-Age=<token lifetime in seconds>
```

Why cookies instead of `localStorage`:

- HttpOnly cookies are not readable by browser JavaScript.
- XSS becomes less likely to directly steal raw tokens.
- The BFF can attach tokens server-side when talking to Laravel.

Cookies do not remove the need for XSS prevention. They reduce the blast radius of token theft.

## BFF Responsibilities

The Next.js BFF should be the only browser-facing layer that handles raw tokens.

It should:

- Accept browser requests from pages and components.
- Read HttpOnly cookies server-side.
- Attach `Authorization: Bearer <access_token>` when calling Laravel.
- Call refresh when the access token is missing or expired and a refresh token exists.
- Retry the original Laravel request after successful refresh.
- Clear cookies when logout or refresh fails.
- Return user-safe JSON to the browser.

It should not:

- Return raw access or refresh tokens to client components.
- Store auth state in localStorage.
- Duplicate Laravel authorization rules.
- Treat cookie presence as proof of identity for backend data access.

`proxy.ts` can protect page navigation, but it cannot fully validate the session. It only checks whether auth cookies exist. Real authorization still happens in Laravel.

## Protected Request Flow

The ideal authenticated BFF flow for future API route handlers:

```text
Browser calls Next.js BFF route
  |
  v
BFF reads access_token cookie
  |
  | if access token exists
  v
BFF calls Laravel with Authorization bearer token
  |
  | if Laravel returns 200
  v
BFF returns data to browser
```

If Laravel returns `401` because the access token has expired:

```text
BFF reads refresh_token cookie
  |
  v
BFF POSTs refresh token to Laravel /api/auth/refresh
  |
  | if refresh succeeds
  v
BFF replaces access_token cookie
  |
  v
BFF retries original Laravel request once
```

If refresh fails:

```text
BFF clears access_token and refresh_token cookies
  |
  v
BFF returns 401 or redirects to /login
```

## Refresh Flow

Current backend route:

```text
POST /api/auth/refresh
```

The refresh middleware currently reads `refresh_token` from the request body:

```php
$refreshToken = $request->input('refresh_token');
```

It then:

1. Hashes the provided token with SHA-256.
2. Looks up the hash in `refresh_token`.
3. Rejects missing or expired tokens.
4. Loads the related user.
5. Sets the authenticated user for the request.
6. Allows `AuthController@refresh` to issue a new Sanctum access token.

Current implementation note: refresh validation exists, but the middleware should still check `revoked_at` and avoid logging token values before production.

## Refresh-Token Rotation

Refresh-token rotation means every successful refresh invalidates the old refresh token and issues a new refresh token along with the new access token.

Without rotation:

- A stolen refresh token remains useful until it expires.
- Replay detection is difficult.
- Logout/revocation has a larger security window.

With rotation:

- A refresh token is single-use.
- If an old refresh token is used again, that is a replay signal.
- The server can revoke the user's whole refresh-token family.

Recommended rotation behavior:

```text
1. Receive refresh token.
2. Hash it and find the active database row.
3. Reject if not found, expired, or revoked.
4. Mark the old row as revoked.
5. Issue a new access token.
6. Generate a new refresh token.
7. Store only the new refresh-token hash.
8. Return both new tokens to the BFF.
9. BFF replaces both cookies atomically.
```

The database already has `revoked_at`, so the table is ready for rotation semantics. The controller currently creates a refresh token on login and creates a new access token on refresh, but it does not yet rotate refresh tokens during refresh.

## Replay Handling

A replay happens when a refresh token that should no longer be valid is used again.

Recommended policy:

- If the hash is found with `revoked_at` already set, treat it as possible token theft.
- Revoke all active refresh tokens for that user.
- Delete or revoke all current access tokens for that user if the risk model requires it.
- Force re-login.
- Log a security event without logging raw tokens.

## Logout Flow

Current logout behavior:

```text
Browser POST /api/auth/logout
  |
  v
Next.js logout route reads access_token cookie
  |
  v
Next.js calls Laravel /api/auth/logout with bearer token
  |
  v
Laravel deletes current access token and refresh tokens for that user
  |
  v
Next.js clears access_token and refresh_token cookies
```

If the access token is already expired or Laravel cannot be reached, the frontend still clears local cookies so the browser is logged out locally.

## Backend Authorization

Laravel remains the source of truth for authorization.

Examples already present:

- `auth:sanctum` protects `/api/auth/me` and hub routes.
- `HubPolicy` allows any authenticated user to list and create hubs.
- Private hubs are visible only to owners and members.
- Only hub owners can update or delete a hub.

The BFF should never replace these checks. It can improve browser ergonomics, but protected data must still require a valid Laravel token.

## Current Gaps To Close

These are implementation gaps, not design blockers:

- Stop logging token values in middleware.
- Make refresh middleware check `revoked_at`.
- Rotate refresh tokens on refresh.
- Return a consistent refresh response shape, ideally matching login:

```json
{
  "data": {
    "user": {},
    "access_token": {
      "access_token": "...",
      "token_type": "Bearer",
      "expires_in": 3600
    },
    "refresh_token": {
      "refresh_token": "...",
      "expires_in": 86400
    }
  },
  "message": "Token refreshed successfully"
}
```

- Add a Next.js refresh BFF route or a shared server-side fetch helper.
- Retry failed authenticated Laravel requests once after refresh.
- Add rate limits to login, register, refresh, and logout.
- Add tests for login, refresh success, expired refresh token, revoked refresh token, logout, and hub authorization.

## Recommended BFF Helper Shape

Future authenticated route handlers should avoid duplicating token logic. A small server-only helper can wrap Laravel calls:

```ts
type BackendFetchOptions = RequestInit & {
  retryOnUnauthorized?: boolean
}

export async function backendFetch(path: string, options: BackendFetchOptions = {}) {
  // 1. Read access_token from cookies().
  // 2. Attach Authorization header if present.
  // 3. Call `${process.env.BACKEND_URL}${path}`.
  // 4. If response is 401, call refresh once when refresh_token exists.
  // 5. Replace cookies from refresh response.
  // 6. Retry the original request once.
  // 7. Return the Laravel response.
}
```

Keep this helper server-only. Do not import it into client components.

## Security Checklist

- Use HTTPS in production.
- Set `secure: true` cookies in production.
- Keep `HttpOnly` on both token cookies.
- Use `SameSite=Lax` unless cross-site auth flows require otherwise.
- Hash refresh tokens before storing them.
- Check `expires_at` and `revoked_at`.
- Rotate refresh tokens.
- Revoke refresh tokens on logout.
- Rate-limit auth endpoints.
- Do not log token values.
- Remove all debug calls before deployment.
- Add monitoring for repeated refresh failures and replay-like patterns.

## Mental Model

Treat Laravel as the vault and judge. Treat Next.js as the receptionist that keeps credentials away from the browser and forwards requests to the correct backend door. The browser should work with session-like endpoints, while Laravel continues to make every real identity and authorization decision.
