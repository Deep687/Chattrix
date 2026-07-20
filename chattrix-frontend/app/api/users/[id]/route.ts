import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return proxyToBackend(`${API_ROUTES.users}/${id}`, {
        errorLabel: "User Route",
    });
}
