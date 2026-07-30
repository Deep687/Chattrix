import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const {id} =await params;
    const body =JSON.stringify(await request.json());

    return proxyToBackend(API_ROUTES.workspaces.invitations(id), {
        method: "POST",
        body,
        errorLabel: "Workspace Invite Route",
    });
}