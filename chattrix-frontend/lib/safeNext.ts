/**
 * Sanitises a `?next=` destination before redirecting to it.
 *
 * Anything that is not a single-slash-prefixed path is discarded. `//evil.com` and
 * `https://evil.com` are both valid values for `window.location`, so an unchecked `next` turns
 * any link into an open redirect — and the invite emails are exactly the links an attacker
 * would want to forge.
 *
 * @param next The raw query-string value, if present.
 * @param fallback Where to go when `next` is absent or rejected.
 */
export function safeNext(next: string | null, fallback = "/dashboard"): string {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
        return fallback;
    }

    return next;
}
