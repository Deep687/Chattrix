import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return proxyToBackend(API_ROUTES.workspaces.conversations(id), {
        errorLabel: "Conversations Route",
    });
}
