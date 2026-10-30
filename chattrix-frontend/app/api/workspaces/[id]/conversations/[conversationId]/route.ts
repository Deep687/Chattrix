import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

type Params = { params: Promise<{ id: string; conversationId: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { id, conversationId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.conversation(id, conversationId), {
        errorLabel: "Conversation Route",
    });
}

export async function DELETE(_request: Request, { params }: Params) {
    const { id, conversationId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.conversation(id, conversationId), {
        method: "DELETE",
        errorLabel: "Conversation Delete Route",
    });
}
