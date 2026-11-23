import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

type Params = { params: Promise<{ id: string; documentId: string }> };

export async function GET(_request: Request, { params }: Params) {
    const { id, documentId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.document(id, documentId), {
        errorLabel: "Document Route",
    });
}

/** Changes the document's audience. JSON, not FormData, so a real PATCH is fine here. */
export async function PATCH(request: Request, { params }: Params) {
    const { id, documentId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.document(id, documentId), {
        method: "PATCH",
        body: await request.text(),
        errorLabel: "Document Update Route",
    });
}

export async function DELETE(_request: Request, { params }: Params) {
    const { id, documentId } = await params;

    return proxyToBackend(API_ROUTES.workspaces.document(id, documentId), {
        method: "DELETE",
        errorLabel: "Document Delete Route",
    });
}
