export async function POST(request: Request) {
    const body = await request.json()

    let backendRes: Response
    try {
        backendRes = await fetch(`${process.env.BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
        })
    } catch (err) {
        console.error('[signup route] fetch failed:', err)
        return Response.json({ message: 'Could not reach backend' }, { status: 502 })
    }

    const data = await backendRes.json()

    return Response.json(data, { status: backendRes.status })
}
