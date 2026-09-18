import { API_ROUTES } from '@/lib/api'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const hash = searchParams.get('hash')
    const expires = searchParams.get('expires')
    const signature = searchParams.get('signature')

    if (!id || !hash || !expires || !signature) {
        return Response.json({ message: 'Missing verification parameters' }, { status: 400 })
    }

    const backendUrl = `${API_ROUTES.auth.verifyEmail(id, hash)}?expires=${expires}&signature=${signature}`

    let backendRes: Response
    try {
        backendRes = await fetch(backendUrl, { headers: { Accept: 'application/json' } })
    } catch (err) {
        console.error('[verify-email route] fetch failed:', err)
        return Response.json({ message: 'Could not reach backend' }, { status: 502 })
    }

    const data = await backendRes.json()

    return Response.json(data, { status: backendRes.status })
}
