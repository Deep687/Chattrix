import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    return proxyToBackend(`${API_ROUTES.hubs}/${slug}/join`, {
        method: "POST",
        errorLabel: "Hub Join Route",
    });
}
