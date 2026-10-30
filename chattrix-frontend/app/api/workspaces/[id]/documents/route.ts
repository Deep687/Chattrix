import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return proxyToBackend(API_ROUTES.workspaces.documents(id), {
        errorLabel: "Workspace Documents Route",
    });
}

/** Forwarded as FormData, unlabelled, so fetch writes its own multipart boundary. */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.formData();

    return proxyToBackend(API_ROUTES.workspaces.documents(id), {
        method: "POST",
        body,
        errorLabel: "Document Upload Route",
    });
}
