const BASE_URL = process.env.BACKEND_URL

export const API_ROUTES = {
    auth: {
        register: `${BASE_URL}/api/auth/register`,
        login:    `${BASE_URL}/api/auth/login`,
        logout:   `${BASE_URL}/api/auth/logout`,
        me:       `${BASE_URL}/api/auth/me`,
        refresh:  `${BASE_URL}/api/auth/refresh`,
    },
    hubs: `${BASE_URL}/api/hubs`,
}

// Public storage assets (avatars, etc.) are served directly to the browser,
// so this needs the public base URL, not the server-only BACKEND_URL.
const ASSET_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function assetUrl(path: string): string {
    return `${ASSET_BASE_URL}/storage/${path}`
}
