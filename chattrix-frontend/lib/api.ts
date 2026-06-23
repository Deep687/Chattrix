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
