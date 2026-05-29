import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    let backendRes: Response

    try {
        backendRes = await fetch(
            `${process.env.BACKEND_URL}/api/auth/logout`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        )
    } catch (err) {
        console.error('[logout route] fetch failed:', err)
        return Response.json(
            { message: 'Could not reach backend' },
            { status: 502 }
        )
    }

    cookieStore.delete('token')

    const data = await backendRes.json()

    return Response.json(data, {
        status: backendRes.status,
    })
}