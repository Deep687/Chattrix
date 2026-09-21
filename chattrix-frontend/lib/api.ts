const BASE_URL = process.env.BACKEND_URL

export const API_ROUTES = {
    auth: {
        register: `${BASE_URL}/api/auth/register`,
        login:    `${BASE_URL}/api/auth/login`,
        logout:   `${BASE_URL}/api/auth/logout`,
        me:       `${BASE_URL}/api/auth/me`,
        refresh:  `${BASE_URL}/api/auth/refresh`,
        verifyEmail: (id: string, hash: string) => `${BASE_URL}/api/auth/email/verify/${id}/${hash}`,
        resendVerification: `${BASE_URL}/api/auth/email/resend`,
    },
    users: `${BASE_URL}/api/users`,

    // `base` serves both the scoped listing (GET) and creation (POST) — same URL, the method
    // is what differs. The per-workspace URLs take the numeric id, since workspaces have no
    // slug: they are private, so there is nothing to make a readable URL for.
    workspaces: {
        base:    `${BASE_URL}/api/workspaces`,
        show:    (id: string | number) => `${BASE_URL}/api/workspaces/${id}`,
        members: (id: string | number) => `${BASE_URL}/api/workspaces/${id}/members`,
        invitations: (id: string | number) => `${BASE_URL}/api/workspaces/${id}/invitations`,
    },

    // Redeeming an invite is keyed by the emailed token, not by workspace id: the invitee
    // cannot be told the id before they are a member, so these sit outside `workspaces`.
    invitations: {
        show:   (token: string) => `${BASE_URL}/api/workspaces/invitations/${token}`,
        accept: (token: string) => `${BASE_URL}/api/workspaces/invitations/${token}/accept`,
    },
}

// Public storage assets (avatars, etc.) are served directly to the browser,
// so this needs the public base URL, not the server-only BACKEND_URL.
const ASSET_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function assetUrl(path: string): string {
    return `${ASSET_BASE_URL}/storage/${path}`
}
