import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()

    const accessToken =
        cookieStore.get('access_token')?.value

    if (!accessToken) {
        cookieStore.delete('access_token')

        return Response.json(
            { message: 'Already logged out' },
            { status: 200 }
        )
    }

    let backendRes: Response

    try {
        backendRes = await fetch(
            `${process.env.BACKEND_URL}/api/auth/logout`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
    } catch (err) {
        console.error('[logout route]', err)

        cookieStore.delete('access_token')

        return Response.json(
            { message: 'Logged out locally' },
            { status: 200 }
        )
    }

    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')

    let data

    try {
        data = await backendRes.json()
    } catch {
        data = { message: 'Logged out successfully' }
    }

    // 401 means token already expired — user is effectively logged out
    const status = backendRes.status === 401 ? 200 : backendRes.status

    return Response.json(data, { status })
}