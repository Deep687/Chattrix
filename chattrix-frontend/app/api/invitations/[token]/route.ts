import { API_ROUTES } from "@/lib/api";

/**
 * Reads the invitation behind an emailed token.
 *
 * Unlike every other BFF route this one does not forward a cookie — it cannot. The invitee
 * usually has no account yet, so there is no session to attach; the token in the path is the
 * only credential, and the backend grants nothing but the preview in exchange for it.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const response = await fetch(API_ROUTES.invitations.show(token), {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        return Response.json(await response.json(), { status: response.status });
    } catch (error) {
        console.error("[Invitation Preview Route]", error);

        return Response.json({ message: "Could not reach backend" }, { status: 502 });
    }
}
