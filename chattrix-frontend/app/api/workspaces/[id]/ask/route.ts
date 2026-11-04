import { cookies } from "next/headers";
import { API_ROUTES } from "@/lib/api";

/**
 * Relays the answer stream byte for byte instead of using `proxyToBackend`, which reads the whole
 * body as JSON and would hold the answer until it finished.
 *
 * Errors before the stream opens (401/403/422/429) are plain JSON and pass through with their
 * status. The browser's abort signal is forwarded, so a closed tab stops the model call upstream.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const accessToken = (await cookies()).get("access_token");

    if (!accessToken) {
        return Response.json({ message: "No access token found" }, { status: 401 });
    }

    try {
        const upstream = await fetch(API_ROUTES.workspaces.ask(id), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                Accept: "text/event-stream, application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(await request.json()),
            signal: request.signal,
            cache: "no-store",
        });

        if (!upstream.ok || !upstream.body) {
            return Response.json(await upstream.json().catch(() => ({})), { status: upstream.status });
        }

        return new Response(upstream.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error) {
        console.error("[Ask Route]", error);

        return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
