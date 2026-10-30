import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

type Params = { params: Promise<{ id: string; documentId: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { id, documentId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.document(id, documentId), {
        errorLabel: "Document Route",
    });
}

export async function DELETE(_request: Request, { params }: Params) {
    const { id, documentId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.document(id, documentId), {
        method: "DELETE",
        errorLabel: "Document Delete Route",
    });
}
