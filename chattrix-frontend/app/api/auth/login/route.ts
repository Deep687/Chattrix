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

    const cookieStore = await cookies()
    cookieStore.set(
        'token',
        data.data.token.access_token,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: data.data.token.expires_in,
        }
    )

    return Response.json({ message: data.message, data: data.data.user })
}
