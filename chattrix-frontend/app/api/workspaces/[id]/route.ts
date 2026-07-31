import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

/**
 * Updates a workspace. Exported as POST, not PATCH, on purpose.
 *
 * PHP only parses `multipart/form-data` on POST, so a real PATCH arrives with an empty `$_FILES`
 * and the avatar is silently dropped. The client appends `_method=PATCH` to the FormData and
 * Laravel rewrites the verb before routing.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.formData();

    return proxyToBackend(API_ROUTES.workspaces.show(id), {
        method: "POST",
        body,
        errorLabel: "Workspace Update Route",
    });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    return proxyToBackend(API_ROUTES.workspaces.show(id), {
        method: "DELETE",
        errorLabel: "Workspace Delete Route",
    });
}
