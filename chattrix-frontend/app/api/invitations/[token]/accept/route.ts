import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    return proxyToBackend(API_ROUTES.invitations.accept(token), {
        method: "POST",
        errorLabel: "Invitation Accept Route",
    });
}
