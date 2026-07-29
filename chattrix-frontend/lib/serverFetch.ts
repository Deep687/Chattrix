import { cookies } from "next/headers";

/**
 * Reads from the Laravel API inside a Server Component.
 *
 * This is the server-side counterpart to `proxyToBackend`, and the distinction matters:
 * `proxyToBackend` returns a `Response` for relaying back to the browser, because it exists to
 * serve client-side `fetch` calls that cannot read the httpOnly token cookie themselves. A
 * Server Component already runs on the server with the same cookie access, so it needs the
 * parsed data — not a Response to forward, and not an extra HTTP hop through our own API route.
 *
 * Returns `null` on a missing token or any non-OK status, so a page can degrade to its empty
 * state rather than throwing. Callers that need to distinguish "unauthenticated" from "empty"
 * should not use this helper.
 */
export async function fetchFromBackend<T>(url: string): Promise<T | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
        return null;
    }

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                Accept: "application/json",
            },
            // Tenant data must never be served from a shared cache, and the list changes as
            // soon as the user creates a workspace.
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error("[serverFetch]", error);

        return null;
    }
}
