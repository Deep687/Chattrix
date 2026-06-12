import { cookies } from 'next/headers'

export async function POST(request: Request) {
    const body = await request.json()

    let backendRes: Response
    try {
        backendRes = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
        })
    } catch (err) {
        console.error('[login route] fetch failed:', err)
        return Response.json({ message: 'Could not reach backend' }, { status: 502 })
    }

    const data = await backendRes.json()

    if (!backendRes.ok) {
        return Response.json(data, { status: backendRes.status })
    }

    const accessToken: string | undefined = data?.data?.access_token?.access_token
    const refreshToken: string | undefined = data?.data?.refresh_token?.refresh_token

    if (!accessToken || !refreshToken) {
        console.error('[login route] unexpected response shape:', JSON.stringify(data))
        return Response.json({ message: 'Login failed: malformed token response' }, { status: 502 })
    }

    const cookieStore = await cookies()
    cookieStore.set(
        'access_token',
        accessToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: data.data.access_token.expires_in,
        }
    )

    cookieStore.set(
        'refresh_token',
        refreshToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: data.data.refresh_token.expires_in,
        }
    )



    return Response.json({ message: data.message, data: data.data.user })
}
