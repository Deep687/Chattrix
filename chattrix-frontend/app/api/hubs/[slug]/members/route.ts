import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    return proxyToBackend(`${API_ROUTES.hubs}/${slug}/members`, {
        errorLabel: "Hub Members Route",
    });
}
