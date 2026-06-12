 1. proxy.ts never runs — all protected routes are unprotected chattrix-frontend/proxy.ts
  Next.js only treats a file named middleware.ts at the project root as middleware. proxy.ts is never
  auto-invoked, so the dashboard and every other protected route are completely open to unauthenticated
  requests.
  Fix: rename proxy.ts → middleware.ts and rename the exported function to middleware.

  ---
  2. refresh() response key mismatch AuthController.php:134
  login() returns the token under data.access_token.access_token. refresh() returns it under
  data.token.access_token. Any frontend refresh call will dereference the wrong path, store undefined, and
  break every subsequent authenticated request.
  Fix: rename 'token' → 'access_token' in the refresh response to match login.

  ---
  3. auth:sanctum-refresh guard accepts any valid access token chattrix-backend/routes/api.php:39
  The guard is registered with driver: 'sanctum' pointing at the standard users provider — identical to the
  default sanctum guard. It never consults the refresh_tokens table. Any non-expired access token can call
  POST /auth/refresh indefinitely, bypassing the refresh-token design entirely.
  Fix: implement a custom guard driver (or middleware) that validates the bearer token against the
  refresh_tokens table.

  ---
  4. Proxy AND condition lets users through with a stale refresh_token proxy.ts:7
  !access_token && !refresh_token only redirects when both cookies are absent. If access_token is missing
  but refresh_token exists (which happens on the early-return and catch paths below), the user passes the
  guard with no valid session.
  Fix: change to !access_token (the access token is the session proof; the refresh token is a background
  rotation detail).

  ---
  5. refresh_token cookie not deleted on early-return logout path logout/route.ts:9–16
  When access_token is missing, the function returns early deleting only access_token. The refresh_token
  cookie persists in the browser, keeping the user apparently "logged in" through the proxy guard (see #4).
  Fix: add cookieStore.delete('refresh_token') before the early return.

  ---
  6. refresh_token cookie not deleted on network-error logout path logout/route.ts:31–39
  Same issue in the catch block — only access_token is deleted on a backend fetch failure.
  Fix: add cookieStore.delete('refresh_token') in the catch block.

  ---
  7. createRefreshToken() hardcodes 1-day expiry, ignores config AuthController.php:153
  login() reads config('auth_tokens.refresh_token_expiration_days') and uses it in the response expires_in,
  but createRefreshToken() always writes now()->addDay(). If REFRESH_TOKEN_EXPIRATION_DAYS is set to
  anything other than 1, the DB row expires before the browser cookie, causing valid-looking refresh tokens
  to be silently rejected.
  Fix: pass $refreshTokenExpirationInDays into createRefreshToken() and use it:
  now()->addDays($expirationDays).

  ---
  8. refresh() never rotates the refresh token AuthController.php:118–142
  The refresh endpoint issues a new access token but leaves the old RefreshToken row untouched. The same
  refresh token can be reused indefinitely until its expiry — there is no single-use guarantee. A stolen
  refresh token is permanently valid.
  Fix: delete the old RefreshToken row and insert a new one with each refresh call, returning the new
  refresh token to the client.